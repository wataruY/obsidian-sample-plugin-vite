{
  description = "A basic flake to with Gleam language";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    git-hooks-nix.url = "github:cachix/git-hooks.nix";
    devenv.url = "github:cachix/devenv";
  };

  outputs =
    inputs@{
      # self,
      # systems,
      # nixpkgs,
      flake-parts,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.treefmt-nix.flakeModule
        inputs.git-hooks-nix.flakeModule
      ];
      systems = import inputs.systems;

      perSystem =
        {
          config,
          pkgs,
          system,
          ...
        }:
        let
          # stdenv = pkgs.stdenv;

          use-only-nix = with pkgs; [
            nil
            nixd
          ];

          git-secrets' = pkgs.writeShellApplication {
            name = "git-secrets";
            runtimeInputs = [ pkgs.git-secrets ];
            text = ''
              git secrets --scan
            '';
          };

        in
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [
              # inputs.gleam-overlay.overlays.default
              # inputs.gleam2nix.overlays.default
              # inputs.fenix.overlays.default
              # inputs.deno-overlay.overlays.deno-overlay
            ];
            config = { };
          };

          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
            };

            settings.formatter = { };
          };

          pre-commit = {
            check.enable = true;
            settings = {
              hooks = {
                treefmt.enable = false; # <- BUG: VERY slow using treefmt in prek
                ripsecrets.enable = true;
                bun-format = {
                  enable = true;
                  name = "Format with bun";
                  entry = "bun fmt";
                  language = "system";
                  pass_filenames = false;
                  stages = [ "pre-commit" ];
                };
                git-secrets = {
                  enable = true;
                  name = "git-secrets";
                  entry = "${git-secrets'}/bin/git-secrets";
                  language = "system";
                  types = [ "text" ];
                };
                gitleaks = {
                  enable = true;
                  entry = "${pkgs.gitleaks}/bin/gitleaks protect --staged";
                  language = "system";
                };
                gitlint.enable = true;
              };
              package = pkgs.prek;
            };
          };

          devShells.default = pkgs.mkShell {
            shellHook = ''
              ${config.pre-commit.shellHook}
              echo 1>&2 "Start development shell"
            '';
            packages =
              use-only-nix
              ++ (with pkgs; [
                bun
                nodejs
                treefmt
                nixfmt
                watchexec
                oxlint
                typescript-language-server
              ]);
          };

          packages = {
            # dockerImage = devShellImage;
          };
        };
    };
}
