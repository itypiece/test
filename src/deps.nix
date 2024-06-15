{ lib, fetchFromGitHub, buildNpmPackage, writeTextDir, runCommand, writeText }:

with lib;

let
  hash = import ../generated/hash.nix;
in deps: buildNpmPackage {
  name = "koishi";
  makeCacheWritable = true;
  npmFlags = [ "--legacy-peer-deps" "--no-cache" ];
  dontNpmBuild = true;
  src = runCommand "deps" {} ''
    mkdir -p $out
    cp ${writeText "package.json" (strings.toJSON {
      name = "deps";
      version = "0.0.0";
      dependencies = listToAttrs (map (name: nameValuePair name "*") (deps ++ ["koishi"]));
    })} $out/package.json
    cp ${../generated/package-lock.json} $out/package-lock.json
  '';
  installPhase = ''
    mkdir -p $out
    mv node_modules $out/node_modules
  '';
}
