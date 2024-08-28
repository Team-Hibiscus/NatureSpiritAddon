import { world } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("natures_spirit:sapling", {
    onRandomTick({ block, dimension }) {
      function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

      const type = block.typeId.split(":")[1].split("_sapling")[0];
      if (!block.permutation.getState("natures_spirit:age_bit")) {
        block.setPermutation(
          block.permutation.withState("natures_spirit:age_bit", true)
        );
      } else if (block.permutation.getState("natures_spirit:age_bit")) {
        if (
          type == "redwood" &&
          block?.south()?.typeId == "natures_spirit:redwood_sapling" &&
          block?.south()?.east()?.typeId == "natures_spirit:redwood_sapling" &&
          block?.south()?.east()?.north()?.typeId ==
            "natures_spirit:redwood_sapling"
        ) {
          world.structureManager.place(
            `redwood_large_${randomInt(1, 4)}`,
            dimension,
            {
              x: block.location.x - 3,
              y: block.location.y,
              z: block.location.z - 3,
            }
          );
        } else {
          world.structureManager.place(
            `natures_spirit:${type}_${randomInt(1, 4)}`,
            dimension,
            {
              x: block.location.x - 3,
              y: block.location.y,
              z: block.location.z - 3,
            }
          );
        }
      }
    },
  });
});
