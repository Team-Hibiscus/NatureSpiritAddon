import { BlockPermutation, ItemStack, World, world } from "@minecraft/server";

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
      if (itemStack == undefined) return;
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
      }
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

        if (block.east().hasTag(tag) && !block.east().typeId.includes("sign")) {
          const eastBlock = block.east();
          e.permutationToPlace = e.permutationToPlace.withState("natures_spirit:east", true);
          if (eastBlock.hasTag("natures_spirit:fence")) {
            eastBlock.setPermutation(eastBlock.permutation.withState("natures_spirit:west", true));
          }
        }

        if (block.west().hasTag(tag) && !block.west().typeId.includes("sign")) {
          const westBlock = block.west();
          e.permutationToPlace = e.permutationToPlace.withState("natures_spirit:west", true);
          if (westBlock.hasTag("natures_spirit:fence")) {
            westBlock.setPermutation(westBlock.permutation.withState("natures_spirit:east", true));
          }
        }

        if (block.north().hasTag(tag) && !block.north().typeId.includes("sign")) {
          const northBlock = block.north();
          e.permutationToPlace = e.permutationToPlace.withState("natures_spirit:north", true);
          if (northBlock.hasTag("natures_spirit:fence")) {
            northBlock.setPermutation(northBlock.permutation.withState("natures_spirit:south", true));
          }
        }

        if (block.south().hasTag(tag) && !block.south().typeId.includes("sign")) {
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

  blockTypeRegistry.registerCustomComponent("natures_spirit:fence_gate", {
    onPlayerInteract(arg) {
      const { block, player } = arg;
      const currentState = block.permutation.getState("natures_spirit:open");
      const newOpenState = !currentState;
      const newPermutation = BlockPermutation.resolve(block.typeId, {
        ...block.permutation.getAllStates(),
        "natures_spirit:open": newOpenState,
      });
      block.setPermutation(newPermutation);
      const sound = currentState ? "open.fence_gate" : "close.fence_gate";
      player.playSound(sound);
    },
  });

  blockTypeRegistry.registerCustomComponent("natures_spirit:log", {
    onPlayerInteract(arg) {
      const { block, player } = arg;
      const equipment = player.getComponent("equippable");
      const itemStack = equipment.getEquipment("Mainhand");
      const namespace = block.typeId.split(":")[0];
      const logName = block.typeId.split(":")[1];
      if (itemStack.typeId.includes("axe")) {
        const newPermutation = BlockPermutation.resolve(namespace + ":stripped_" + logName, {
          ...block.permutation.getAllStates(),
        });
        block.setPermutation(newPermutation);

        const itemEnchantmentComp = itemStack.getComponent("minecraft:enchantable");
        const unbreakingLevel = itemEnchantmentComp?.getEnchantment("unbreaking")?.level ?? 0;
        const breakChance = 100 / (unbreakingLevel + 1);
        const randomizeChance = Math.random() * 100;
        if (breakChance < randomizeChance) return;
        const itemUsedDurabilityComp = itemStack.getComponent("durability");
        if (!itemUsedDurabilityComp) return;
        itemUsedDurabilityComp.damage += 1;
        const maxDurability = itemUsedDurabilityComp.maxDurability;
        const currentDamage = itemUsedDurabilityComp.damage;
        if (currentDamage >= maxDurability) {
          player.playSound("random.break", { pitch: 1, location: player.location, volume: 1 });
          equipment.setEquipment("Mainhand", new ItemStack("minecraft:air", 1));
        } else;

        equipment.setEquipment("Mainhand", itemStack);
      }
    },
  });

  blockTypeRegistry.registerCustomComponent("natures_spirit:sapling", {
    onRandomTick(arg) {
      let { block, dimension } = arg;
      function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

      const type = block.typeId.split(":")[1].split("_sapling")[0];
      if (!block.permutation.getState("natures_spirit:age_bit")) {
        block.setPermutation(block.permutation.withState("natures_spirit:age_bit", true));
      } else if (block.permutation.getState("natures_spirit:age_bit")) {
        if (
          type == "redwood" &&
          block.south().typeId == "natures_spirit:redwood_sapling" &&
          block.south().east().typeId == "natures_spirit:redwood_sapling" &&
          block.south().east().north().typeId == "natures_spirit:redwood_sapling"
        ) {
          world.structureManager.place(`redwood_large_${randomInt(1, 4)}`);
        } else {
          world.structureManager.place(`natures_spirit:${type}_${randomInt(1, 4)}`, dimension, {
            x: block.location.x - 3,
            y: block.location.y,
            z: block.location.z - 3,
          });
        }
      }
    },
  });
});

world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  tags.forEach((tag) => {
    if (block.hasTag(tag) && !block.typeId.includes("sign")) {
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
    if (brokenBlockPermutation.hasTag(tag) && !block.typeId.includes("sign")) {
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
