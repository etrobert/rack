{
  description = "The Rack — a curated secondhand clothing catalog";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.buildNpmPackage {
            pname = "rack";
            version = "1.0.0";
            src = ./.;
            npmDeps = pkgs.importNpmLock { npmRoot = ./.; };
            npmConfigHook = pkgs.importNpmLock.npmConfigHook;
            installPhase = ''
              cp -r dist $out
            '';
          };
        }
      );

      # Self-contained deployment: serves the static site via Caddy. The domain
      # is a consumer option (not hardcoded), so the project isn't bound to any
      # one host. Images and piece data are NOT bundled — they're served
      # separately from files.etiennerobert.com + imgproxy and discovered at
      # runtime.
      nixosModules.default =
        {
          config,
          lib,
          pkgs,
          ...
        }:
        let
          inherit (pkgs.stdenv.hostPlatform) system;
          cfg = config.services.rack;
        in
        {
          options.services.rack = {
            enable = lib.mkEnableOption "The Rack curated clothing catalog";

            hostName = lib.mkOption {
              type = lib.types.str;
              example = "rack.example.com";
              description = "Domain Caddy serves The Rack on.";
            };
          };

          config = lib.mkIf cfg.enable {
            services.caddy = {
              enable = true;
              virtualHosts.${cfg.hostName}.extraConfig = ''
                root * ${self.packages.${system}.default}
                encode zstd gzip
                try_files {path} /index.html
                file_server
              '';
            };
          };
        };

      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell { packages = [ pkgs.nodejs_24 ]; };
        }
      );

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt);
    };
}
