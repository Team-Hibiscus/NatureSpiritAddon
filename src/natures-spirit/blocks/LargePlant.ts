import { BlockPermutation, world } from "@minecraft/server";

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
            const permutation = block.permutation.getState('natures_spirit:top_bit')
            block.dimension.runCommand(`setblock ${block.location.x} ${block.location.y + (permutation ? -1 : 1)} ${block.location.z} air destroy`)
        },
    });
});