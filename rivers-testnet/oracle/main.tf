# Copyright (c) Mysten Labs, Inc.
# SPDX-License-Identifier: Apache-2.0
#
# Oracle Cloud Resource Manager stack for one Rivers validator. The "Deploy to Oracle Cloud" button
# in Rivers Validator → Launch opens this stack. It creates a network, a firewall that opens the
# validator ports, and one Ampere A1 server inside the Always Free allowance, and passes the
# launch code to validator-setup.sh, which runs once at first boot.

terraform {
  required_version = ">= 1.2"
  required_providers {
    oci = {
      source = "oracle/oci"
    }
  }
}

# Resource Manager fills these three in.
variable "tenancy_ocid" {}
variable "region" {}
variable "compartment_ocid" {}

variable "launch_code" {
  description = "Launch code from Rivers Validator → Launch."
  sensitive   = true
  validation {
    condition     = can(jsondecode(base64decode(trimspace(var.launch_code))).r)
    error_message = "This is not a Rivers launch code. Copy it again from Rivers Validator → Launch."
  }
}

variable "availability_domain" {
  description = "Availability domain number. Try another number if Oracle reports that it is out of capacity."
  type        = number
  default     = 1
}

# 2 OCPUs and 12 GB is the Always Free allowance for Ampere A1 servers in 2026.
variable "ocpus" {
  type    = number
  default = 2
}
variable "memory_gbs" {
  type    = number
  default = 12
}
# Always Free includes 200 GB of block storage in total, boot disks included.
variable "disk_gbs" {
  type    = number
  default = 150
}

variable "ssh_public_key" {
  description = "Optional. Only needed to log in to the server."
  default     = ""
}

provider "oci" {
  region = var.region
}

locals {
  code    = jsondecode(base64decode(trimspace(var.launch_code)))
  name    = substr(replace(lower(lookup(local.code, "n", "rivers")), "/[^a-z0-9]+/", "-"), 0, 40)
  ads     = data.oci_identity_availability_domains.ads.availability_domains
  ad      = local.ads[min(max(var.availability_domain, 1), length(local.ads)) - 1].name
  ports   = [["6", 8080], ["6", 8081], ["17", 8081], ["17", 8082], ["17", 8084]]
  setup   = file("${path.module}/validator-setup.sh")
  startup = "#!/bin/bash\nexport RIVERS_LAUNCH_CODE='${trimspace(var.launch_code)}'\n${local.setup}"
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_core_images" "ubuntu" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_vcn" "rivers" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = ["10.42.0.0/16"]
  display_name   = "rivers-${local.name}"
  dns_label      = "rivers"
}

resource "oci_core_internet_gateway" "rivers" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.rivers.id
  display_name   = "rivers-internet"
}

resource "oci_core_route_table" "rivers" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.rivers.id
  display_name   = "rivers-routes"
  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.rivers.id
  }
}

resource "oci_core_security_list" "rivers" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.rivers.id
  display_name   = "rivers-validator-ports"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }
  ingress_security_rules {
    source   = "0.0.0.0/0"
    protocol = "6"
    tcp_options {
      min = 22
      max = 22
    }
  }
  dynamic "ingress_security_rules" {
    for_each = local.ports
    content {
      source   = "0.0.0.0/0"
      protocol = ingress_security_rules.value[0]
      dynamic "tcp_options" {
        for_each = ingress_security_rules.value[0] == "6" ? [1] : []
        content {
          min = ingress_security_rules.value[1]
          max = ingress_security_rules.value[1]
        }
      }
      dynamic "udp_options" {
        for_each = ingress_security_rules.value[0] == "17" ? [1] : []
        content {
          min = ingress_security_rules.value[1]
          max = ingress_security_rules.value[1]
        }
      }
    }
  }
}

resource "oci_core_subnet" "rivers" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.rivers.id
  cidr_block        = "10.42.1.0/24"
  display_name      = "rivers-public"
  dns_label         = "validator"
  route_table_id    = oci_core_route_table.rivers.id
  security_list_ids = [oci_core_security_list.rivers.id]
}

resource "oci_core_instance" "validator" {
  compartment_id      = var.compartment_ocid
  availability_domain = local.ad
  display_name        = "rivers-${local.name}"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = var.ocpus
    memory_in_gbs = var.memory_gbs
  }
  create_vnic_details {
    subnet_id        = oci_core_subnet.rivers.id
    assign_public_ip = true
  }
  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu.images[0].id
    boot_volume_size_in_gbs = var.disk_gbs
  }
  metadata = merge(
    { user_data = base64encode(local.startup) },
    var.ssh_public_key == "" ? {} : { ssh_authorized_keys = var.ssh_public_key }
  )
  lifecycle {
    ignore_changes = [source_details[0].source_id]
  }
}

output "server_ip" {
  value = oci_core_instance.validator.public_ip
}

output "next_step" {
  value = "The server is setting up Rivers. Go back to Rivers Validator → Launch: the page shows when the validator is funded, registered and active. This takes about 15 minutes."
}
