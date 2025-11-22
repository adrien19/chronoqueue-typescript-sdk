#!/usr/bin/env node
/**
 * Script to compile proto files to TypeScript using ts-proto
 * This script is called by the Makefile gen-proto target
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, rmSync } from "fs";
import { globSync } from "glob";
import { join, resolve } from "path";

const ROOT_DIR = resolve(__dirname, "../../..");
const PROTO_PATH = join(ROOT_DIR, "proto");
const PROTO_OUT = join(__dirname, "..", "src", "generated");
const PROTOC = join(ROOT_DIR, "node_modules", ".bin", "protoc");
const TS_PROTO = join(ROOT_DIR, "node_modules", ".bin", "protoc-gen-ts_proto");

console.log("🔧 ChronoQueue Proto Compilation Script");
console.log("========================================\n");

// Check if proto directory exists
if (!existsSync(PROTO_PATH)) {
  console.error(`❌ Error: Proto directory not found at ${PROTO_PATH}`);
  console.error('   Run "make update-proto" to download proto definitions.');
  process.exit(1);
}

// Check if protoc and ts-proto are installed
if (!existsSync(PROTOC)) {
  console.error("❌ Error: protoc not found. Installing...");
  execSync("pnpm add -D protoc", { cwd: ROOT_DIR, stdio: "inherit" });
}

if (!existsSync(TS_PROTO)) {
  console.error("❌ Error: ts-proto not found. Installing...");
  execSync("pnpm add -D ts-proto", { cwd: ROOT_DIR, stdio: "inherit" });
}

// Find all proto files
const protoFiles = globSync("**/*.proto", { cwd: PROTO_PATH });

if (protoFiles.length === 0) {
  console.error(`❌ Error: No proto files found in ${PROTO_PATH}`);
  console.error('   Run "make update-proto" to download proto definitions.');
  process.exit(1);
}

console.log(`📦 Found ${protoFiles.length} proto file(s):`);
protoFiles.forEach((file) => console.log(`   - ${file}`));
console.log();

// Clean output directory
if (existsSync(PROTO_OUT)) {
  console.log(`🧹 Cleaning output directory: ${PROTO_OUT}`);
  rmSync(PROTO_OUT, { recursive: true, force: true });
}

// Create output directory
mkdirSync(PROTO_OUT, { recursive: true });
console.log(`📁 Created output directory: ${PROTO_OUT}\n`);

// Build protoc command
const protoFilePaths = protoFiles.map((file) => join(PROTO_PATH, file));

const cmd = [
  PROTOC,
  `--plugin=protoc-gen-ts_proto=${TS_PROTO}`,
  `--ts_proto_out=${PROTO_OUT}`,
  "--ts_proto_opt=outputServices=grpc-js",
  "--ts_proto_opt=esModuleInterop=true",
  "--ts_proto_opt=forceLong=string",
  "--ts_proto_opt=useOptionals=messages",
  `-I${PROTO_PATH}`,
  ...protoFilePaths,
].join(" ");

console.log("🚀 Running protoc...\n");
console.log(`Command: ${cmd}\n`);

try {
  execSync(cmd, { cwd: ROOT_DIR, stdio: "inherit" });
  console.log("\n✅ TypeScript code generated successfully!");
  console.log(`   Output: ${PROTO_OUT}\n`);
} catch (error) {
  console.error("\n❌ Error generating TypeScript code from proto files");
  process.exit(1);
}
