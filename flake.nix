{
    description = "Node.js dev shell";

    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

        nix-vite-plus = {
            url = "github:ryoppippi/nix-vite-plus";
            inputs.nixpkgs.follows = "nixpkgs";
        };
    };

    outputs =
        { nixpkgs, nix-vite-plus, ... }:
        let
            system = "x86_64-linux";
            pkgs = nixpkgs.legacyPackages.${system};
        in
        {
            devShells.${system}.default = pkgs.mkShell {
                packages = with pkgs; [
                    nodejs
                    pnpm
                    sassc

                    node-gyp
                    gnumake

                    # lsp / formatters
                    oxfmt
                    oxlint
                    biome
                    typescript
                    astro-language-server
                    tailwindcss-language-server
                    nix-vite-plus.packages.${system}.vp

                    # nvim-dap looks for js-debug-adapter
                    vscode-js-debug
                    (writeShellScriptBin "js-debug-adapter" ''
                        exec ${lib.getExe vscode-js-debug} "$@"
                    '')
                ];
            };
        };
}
