import { BlockPermutation, World, world } from "@minecraft/server";

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
];

world.beforeEvents.worldInitialize.subscribe(({ blockTypeRegistry }) => {
  blockTypeRegistry.registerCustomComponent("natures_spirit:block_face_2", {
    beforeOnPlayerPlace(arg) {
      let face = arg.face;
      switch (face) {
        case "Up":
          arg.permutationToPlace = arg.permutationToPlace.withState("natures_spirit:hanging", false);
          break;
        case "Down":
          arg.permutationToPlace = arg.permutationToPlace.withState("natures_spirit:hanging", true);
          break;
      }
    },
  });

  blockTypeRegistry.registerCustomComponent("natures_spirit:block_face_3", {
    beforeOnPlayerPlace(arg) {
      let face = arg.face;
      switch (face) {
        case "Up":
        case "Down":
          arg.permutationToPlace = arg.permutationToPlace.withState("natures_spirit:block_face", 0);
          break;
        case "North":
        case "South":
          arg.permutationToPlace = arg.permutationToPlace.withState("natures_spirit:block_face", 1);
          break;
        case "West":
        case "East":
          arg.permutationToPlace = arg.permutationToPlace.withState("natures_spirit:block_face", 2);
          break;
      }
    },
  });

  blockTypeRegistry.registerCustomComponent("natures_spirit:slab", {
    onPlayerInteract(arg) {
      const equipment = arg.player.getComponent("equippable");
      const itemStack = equipment.getEquipment("Mainhand");
      const face = arg.face;
      const block = arg.block;
      const permutation = block.permutation;

      if (itemStack.typeId === block.typeId && !permutation.getState("natures_spirit:double")) {
        const verticalHalfState = permutation.getState("minecraft:vertical_half");
        const isBottomUp = verticalHalfState === "bottom" && face === "Up";
        const isTopDown = verticalHalfState === "top" && face === "Down";

        if (isBottomUp || isTopDown) {
          if (arg.player.getGameMode() !== "creative") {
            itemStack.amount -= 1;
            if (itemStack.amount === 0) {
              equipment.setEquipment("Mainhand", undefined);
            } else {
              equipment.setEquipment("Mainhand", itemStack);
            }
          }
          block.setPermutation(block.permutation.withState("natures_spirit:double", true));
          if (arg.block.hasTag("slab_wood")) {
            arg.player.playSound("use.wood");
          } else if (arg.block.hasTag("slab_stone")) {
            arg.player.playSound("use.stone");
          }
          //block.setWaterlogged(false);
        }

        //   if (verticalHalfState === "top" && arg.face === "Down") {
        //     performActions();
        //   } else if (verticalHalfState === "bottom" && arg.face === "Up") {
        //     performActions();
        //   }
      }

      // function performActions() {
      //   if (arg.player.getGameMode() !== "creative") {
      //     block.setPermutation(permutation.withState("natures_spirit:double", true));
      //     arg.player.runCommand(`gamerule sendcommandfeedback false`);
      //     arg.player.runCommand(`clear @s ${itemStack.typeId} 0 1`);
      //     if (arg.block.hasTag("slab_wood")) {
      //       arg.player.runCommand(`playsound use.wood @a ~~~ 1 0.8`);
      //     }
      //     if (arg.block.hasTag("slab_stone")) {
      //       arg.player.runCommand(`playsound use.stone @a ~~~ 1 0.8`);
      //     }

      //     arg.player.runCommand(`gamerule sendcommandfeedback true`);
      //   } else {
      //     arg.player.runCommand(`gamerule sendcommandfeedback false`);
      //     block.setPermutation(permutation.withState("natures_spirit:double", true));
      //     if (arg.block.hasTag("slab_wood")) {
      //       arg.player.runCommand(`playsound use.wood @a ~~~ 1 0.8`);
      //     }
      //     if (arg.block.hasTag("slab_stone")) {
      //       arg.player.runCommand(`playsound use.stone @a ~~~ 1 0.8`);
      //     }
      //     arg.player.runCommand(`gamerule sendcommandfeedback true`);
      //   }
      // }
    },
  });

  blockTypeRegistry.registerCustomComponent("natures_spirit:trapdoor", {
    onPlayerInteract(arg) {
      const { block, player } = arg;
      const currentState = block.permutation.getState("natures_spirit:open");
      const newOpenState = !currentState;
      const newPermutation = BlockPermutation.resolve(block.typeId, {
        ...block.permutation.getAllStates(),
        "natures_spirit:open": newOpenState,
      });
      block.setPermutation(newPermutation);
      const sound = currentState ? "open.wooden_trapdoor" : "close.wooden_trapdoor";
      player.playSound(sound);
    },
  });

  blockTypeRegistry.registerCustomComponent("natures_spirit:fence", {
    beforeOnPlayerPlace(e) {
      e.permutationToPlace = e.permutationToPlace.withState("natures_spirit:placed", true);

      tags.forEach((tag) => {
        const block = e.block;

        if (block.east().hasTag(tag)) {
          const eastBlock = block.east();
          e.permutationToPlace = e.permutationToPlace.withState("natures_spirit:east", true);
          if (eastBlock.hasTag("natures_spirit:fence")) {
            eastBlock.setPermutation(eastBlock.permutation.withState("natures_spirit:west", true));
          }
        }

        if (block.west().hasTag(tag)) {
          const westBlock = block.west();
          e.permutationToPlace = e.permutationToPlace.withState("natures_spirit:west", true);
          if (westBlock.hasTag("natures_spirit:fence")) {
            westBlock.setPermutation(westBlock.permutation.withState("natures_spirit:east", true));
          }
        }

        if (block.north().hasTag(tag)) {
          const northBlock = block.north();
          e.permutationToPlace = e.permutationToPlace.withState("natures_spirit:north", true);
          if (northBlock.hasTag("natures_spirit:fence")) {
            northBlock.setPermutation(northBlock.permutation.withState("natures_spirit:south", true));
          }
        }

        if (block.south().hasTag(tag)) {
          const southBlock = block.south();
          e.permutationToPlace = e.permutationToPlace.withState("natures_spirit:south", true);
          if (southBlock.hasTag("natures_spirit:fence")) {
            southBlock.setPermutation(southBlock.permutation.withState("natures_spirit:north", true));
          }
        }
      });
    },

    onPlayerDestroy(e) {
      const block = e.block;

      if (block.east().hasTag("natures_spirit:fence")) {
        block.east().setPermutation(block.east().permutation.withState("natures_spirit:west", false));
      }

      if (block.west().hasTag("natures_spirit:fence")) {
        block.west().setPermutation(block.west().permutation.withState("natures_spirit:east", false));
      }

      if (block.north().hasTag("natures_spirit:fence")) {
        block.north().setPermutation(block.north().permutation.withState("natures_spirit:south", false));
      }

      if (block.south().hasTag("natures_spirit:fence")) {
        block.south().setPermutation(block.south().permutation.withState("natures_spirit:north", false));
      }
    },
  });
});

world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  tags.forEach((tag) => {
    if (block.hasTag(tag)) {
      if (block.east().hasTag("natures_spirit:fence")) {
        block.east().setPermutation(block.east().permutation.withState("natures_spirit:west", true));
      }

      if (block.west().hasTag("natures_spirit:fence")) {
        block.west().setPermutation(block.west().permutation.withState("natures_spirit:east", true));
      }

      if (block.north().hasTag("natures_spirit:fence")) {
        block.north().setPermutation(block.north().permutation.withState("natures_spirit:south", true));
      }

      if (block.south().hasTag("natures_spirit:fence")) {
        block.south().setPermutation(block.south().permutation.withState("natures_spirit:north", true));
      }
    }
  });
});

world.afterEvents.playerBreakBlock.subscribe(({ brokenBlockPermutation, block }) => {
  tags.forEach((tag) => {
    if (brokenBlockPermutation.hasTag(tag)) {
      if (block.east().hasTag("natures_spirit:fence")) {
        block.east().setPermutation(block.east().permutation.withState("natures_spirit:west", false));
      }

      if (block.west().hasTag("natures_spirit:fence")) {
        block.west().setPermutation(block.west().permutation.withState("natures_spirit:east", false));
      }

      if (block.north().hasTag("natures_spirit:fence")) {
        block.north().setPermutation(block.north().permutation.withState("natures_spirit:south", false));
      }

      if (block.south().hasTag("natures_spirit:fence")) {
        block.south().setPermutation(block.south().permutation.withState("natures_spirit:north", false));
      }
    }
  });
});

//"natures_spirit:log";
