import { BlockPermutation, ItemStack, world } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("natures_spirit:large_plant", {
        beforeOnPlayerPlace(arg) {
            const { block } = arg
            const upBlockLoc = {
                x: block.location.x,
                y: block.location.y + 1,
                z: block.location.z
            };
            const upBlock = block.dimension.getBlock(upBlockLoc)

            if (upBlock?.typeId === "minecraft:air") {
                upBlock.setPermutation(BlockPermutation.resolve(arg.permutationToPlace.type.id, {
                    ...block.permutation.getAllStates(),
                    "natures_spirit:top_bit": true
                }))
            } else {
                arg.cancel = true
            }
        },

        onPlayerDestroy(arg) {
            const { block } = arg
            const permutation = arg.destroyedBlockPermutation.getState('natures_spirit:top_bit')
            block.dimension.runCommand(`setblock ${block.location.x} ${block.location.y + (permutation ? -1 : 1)} ${block.location.z} air destroy`)

            const data = `${arg.destroyedBlockPermutation.type.id}_item`;
      
            const item = new ItemStack(data, 1);
            const loc = block.location;
            const itemEntity = block.dimension.spawnItem(item, {
              x: loc.x + 0.5,
              y: loc.y + 0.5 + 100,
              z: loc.z + 0.5,
            });
          
            itemEntity.teleport({ x: loc.x + 0.5, y: loc.y + 0.5, z: loc.z + 0.5 });
        },
    });
});