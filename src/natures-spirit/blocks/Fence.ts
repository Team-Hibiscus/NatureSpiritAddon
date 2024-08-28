import { Block, BlockPermutation, world } from "@minecraft/server";

const tags = [
  "fence",
  "metal",
  "wood",
  "stone",
  "wood_pick_diggable",
  "stone_pick_diggable",
  "iron_pick_diggable",
  "diamond_pick_diggable",
  "netherite_pick_diggable",
  "dirt",
  "sand",
  "gravel",
  "grass",
  "snow",
  "fence_gate",
];

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("natures_spirit:fence", {
    beforeOnPlayerPlace(e) {
      e.permutationToPlace = e.permutationToPlace.withState(
        "natures_spirit:placed",
        true
      );

      tags.forEach((tag) => {
        const block = e.block;

        const checkAdjacentBlock = (
          direction: any,
          stateKey: string,
          oppositeStateKey: string
        ) => {
          const adjacentBlock = block?.[direction]();
          if (
            adjacentBlock?.hasTag(tag) &&
            !adjacentBlock.hasTag("text_sign") &&
            !adjacentBlock.hasTag("trapdoors") &&
            !adjacentBlock.hasTag("plant")
          ) {
            e.permutationToPlace = e.permutationToPlace.withState(
              `natures_spirit:${stateKey}`,
              true
            );
            if (adjacentBlock?.hasTag("natures_spirit:fence")) {
              adjacentBlock?.setPermutation(
                adjacentBlock?.permutation.withState(
                  `natures_spirit:${oppositeStateKey}`,
                  true
                )
              );
            }
          }
        };

        checkAdjacentBlock("east", "east", "west");
        checkAdjacentBlock("west", "west", "east");
        checkAdjacentBlock("north", "north", "south");
        checkAdjacentBlock("south", "south", "north");
      });
    },

    onPlayerDestroy({ block }) {
      const updatePermutation = (
        direction: string,
        oppositeDirection: string
      ) => {
        const neighborBlock = block?.[direction]();
        if (neighborBlock?.hasTag("natures_spirit:fence")) {
          neighborBlock.setPermutation(
            neighborBlock.permutation.withState(
              `natures_spirit:${oppositeDirection}`,
              false
            ) as BlockPermutation
          );
        }
      };

      updatePermutation("east", "west");
      updatePermutation("west", "east");
      updatePermutation("north", "south");
      updatePermutation("south", "north");
    },
  });
});

world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  tags.forEach((tag) => {
    if (
      block.hasTag(tag) &&
      !block.hasTag("text_sign") &&
      !block.hasTag("trapdoors") &&
      !block.hasTag("plant")
    ) {
      updateAdjacentBlockState(block, tag, "natures_spirit:west", "east");
      updateAdjacentBlockState(block, tag, "natures_spirit:east", "west");
      updateAdjacentBlockState(block, tag, "natures_spirit:south", "north");
      updateAdjacentBlockState(block, tag, "natures_spirit:north", "south");
    }
  });
});

world.afterEvents.playerBreakBlock.subscribe(
  ({ brokenBlockPermutation, block }) => {
    tags.forEach((tag) => {
      if (
        brokenBlockPermutation.hasTag(tag) &&
        !block.typeId.includes("sign")
      ) {
        updateAdjacentBlockState(
          block,
          tag,
          "natures_spirit:west",
          "east",
          false
        );
        updateAdjacentBlockState(
          block,
          tag,
          "natures_spirit:east",
          "west",
          false
        );
        updateAdjacentBlockState(
          block,
          tag,
          "natures_spirit:south",
          "north",
          false
        );
        updateAdjacentBlockState(
          block,
          tag,
          "natures_spirit:north",
          "south",
          false
        );
      }
    });
  }
);

function updateAdjacentBlockState(block, tag, state, direction, value = true) {
  const adjacentBlock = block[direction]();
  if (adjacentBlock.hasTag("natures_spirit:fence")) {
    adjacentBlock.setPermutation(
      adjacentBlock.permutation.withState(state, value)
    );
  }
}
