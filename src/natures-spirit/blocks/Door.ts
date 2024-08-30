import {
  world,
  system,
  Block,
  MinecraftDimensionTypes,
  ItemStack,
  Vector3,
  Dimension,
  BlockPermutation,
} from "@minecraft/server";

function dimensionToHeight(dimension: string) {
  const height = {
    [MinecraftDimensionTypes.overworld]: 320,
    [MinecraftDimensionTypes.nether]: 128,
    [MinecraftDimensionTypes.theEnd]: 256,
  };
  const data = height[dimension];

  return data.maxHeight;
}

function spawnItemAnywhere(item: ItemStack, location: Vector3, dimension: Dimension) {
  const itemEntity = dimension.spawnItem(item, {
    x: location.x,
    y: 100,
    z: location.z,
  });

  itemEntity.teleport(location);

  return itemEntity;
}

class doorManager {
  static doorTag = "natures_spirit:door";

  static interactWithDoor(block: Block) {
    const dim = block.dimension;
    const loc = block.location;
    const topHalf = block.permutation.getState("natures_spirit:top_bit");
    const open = block.permutation.getState("natures_spirit:open_bit");

    const doorPart = !topHalf ? block.above(1) : block.below(1);
    if (doorPart) {
      const bool = !open;
      const sound = bool ? "open.wooden_door" : "close.wooden_door";
      dim.playSound(sound, loc, { volume: 1, pitch: 1 });
      [block, doorPart].forEach((door) =>
        door.setPermutation(door.permutation.withState("natures_spirit:open_bit", bool))
      );
    }
  }

  static placeDoor(block: Block, aboveBlock: Block) {
    system.runTimeout(() => {
      let reversed: boolean = false;
      const facing = block.permutation.getState("minecraft:cardinal_direction") as string;
      switch (facing) {
        case "north":
          try {
            const otherblock = block.west(1);
            if (otherblock?.typeId.includes("door")) {
              const otherfacing = otherblock?.permutation.getState("minecraft:cardinal_direction");
              if (otherfacing == facing) {
                reversed = true;
              }
            }
          } catch {}
          break;
        case "south":
          try {
            const otherblock = block.east(1);
            if (otherblock?.typeId.includes("door")) {
              const otherfacing = otherblock?.permutation.getState("minecraft:cardinal_direction");
              if (otherfacing == facing) {
                reversed = true;
              }
            }
          } catch {}
          break;
        case "east":
          try {
            const otherblock = block.north(1);
            if (otherblock?.typeId.includes("door")) {
              const otherfacing = otherblock?.permutation.getState("minecraft:cardinal_direction");
              if (otherfacing == facing) {
                reversed = true;
              }
            }
          } catch {}
          break;
        case "west":
          try {
            const otherblock = block.south(1);
            if (otherblock?.typeId.includes("door")) {
              const otherfacing = otherblock?.permutation.getState("minecraft:cardinal_direction");
              if (otherfacing == facing) {
                reversed = true;
              }
            }
          } catch {}
          break;
      }
      block.setPermutation(block.permutation.withState("natures_spirit:reversed", reversed));
      aboveBlock.setPermutation(BlockPermutation.resolve(block.typeId));
      aboveBlock.setPermutation(aboveBlock.permutation.withState("natures_spirit:top_bit", true));
      aboveBlock.setPermutation(
        aboveBlock.permutation
          .withState("minecraft:cardinal_direction", facing)
          .withState("natures_spirit:reversed", reversed)
      );
    });
  }
}

const breakDoor = (blockID: string, block: Block, topHalf: boolean) => {

};

// interface redstonePowerAfterEvent {
//   code: Function;
//   unpowered?: Function;
// }

// class redstoneManager {
//   static powered(block: Block) {
//     if (!block.hasTag(doorManager.doorTag)) return;
//     let powered: boolean = false;
//     let above: Block | undefined = undefined;
//     try {
//       above = block.above(1);
//     } catch {}
//     let below: Block | undefined = undefined;
//     try {
//       below = block.below(1);
//     } catch {}
//     let north: Block | undefined = undefined;
//     try {
//       north = block.north(1);
//     } catch {}
//     let south: Block | undefined = undefined;
//     try {
//       south = block.south(1);
//     } catch {}
//     let east: Block | undefined = undefined;
//     try {
//       east = block.east(1);
//     } catch {}
//     let west: Block | undefined = undefined;
//     try {
//       west = block.west(1);
//     } catch {}
//     const sides = [above, below, north, south, east, west];
//     for (const side of sides) {
//       if (side != undefined && side.getRedstonePower() > 0) powered = true;
//     }
//     return powered;
//   }
//   static redstonePowerAfterEvent(block: Block, event: redstonePowerAfterEvent) {
//     if (!block.hasTag(doorManager.doorTag)) return;
//     const state = block.permutation.getState("natures_spirit:powered");
//     const powered = this.powered(block);
//     if (state) {
//       if (!powered) {
//         block.setPermutation(block.permutation.withState("natures_spirit:powered", false));
//         if (event.unpowered != undefined) event.unpowered(block);
//       }
//       return;
//     }
//     if (!powered) return;
//     block.setPermutation(block.permutation.withState("natures_spirit:powered", true));
//     event.code(block);
//   }
// }

// world.beforeEvents.playerBreakBlock.subscribe((data) => {
//   if (data.block.hasTag(doorManager.doorTag)) {
//     data.cancel = true;

//     breakDoor(data.block.typeId, data.block, data.block.permutation.getState("natures_spirit:top_bit") as boolean);
//   } else
//     try {
//       const blockAbove = data.block.above(1);

//       if (blockAbove?.hasTag(doorManager.doorTag))
//         breakDoor(
//           blockAbove?.typeId,
//           blockAbove,
//           blockAbove?.permutation.getState("natures_spirit:top_bit") as boolean
//         );
//     } catch {}
// });

let int = 0;

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  int = int + 1;
  if (int != 1) return;

  blockComponentRegistry.registerCustomComponent("natures_spirit:door", {
    onTick(data) {
      //   redstoneManager.redstonePowerAfterEvent(data.block, {
      //     code: (block: Block) => {
      //       if (block.permutation.getState("natures_spirit:open_bit") == true) return;
      //       doorManager.interactWithDoor(block);
      //     },
      //     unpowered: (block: Block) => {
      //       const topHalf = block.permutation.getState("natures_spirit:top_bit");
      //       let doorPart: Block = undefined;
      //       if (topHalf == false) {
      //         try {
      //           doorPart = block.above(1);
      //         } catch {}
      //       } else
      //         try {
      //           doorPart = block.below(1);
      //         } catch {}
      //       if (block.permutation.getState("natures_spirit:open_bit") == false) return;
      //       if (
      //         doorPart &&
      //         doorPart.hasTag(doorManager.doorTag) &&
      //         doorPart.permutation.getState("natures_spirit:powered") == true
      //       )
      //         return;
      //       doorManager.interactWithDoor(block);
      //     },
      //   });
      const block = data.block;
      if (!block) return;

      const topHalf = block.permutation.getState("natures_spirit:top_bit");
      let doorPart: Block | undefined = undefined;
      if (topHalf == false) {
        try {
          doorPart = block.above(1);
        } catch {}
      } else
        try {
          doorPart = block.below(1);
        } catch {}
      if (doorPart == undefined) {
        if (topHalf == true) {
          block.setPermutation(BlockPermutation.resolve("minecraft:air"));
        } else {
          const item = new ItemStack(`${block.typeId}_item`, 1);
          spawnItemAnywhere(item, block.location, block.dimension);
          block.setPermutation(BlockPermutation.resolve("minecraft:air"));
        }
      } else if (!doorPart.hasTag(doorManager.doorTag)) {
        if (topHalf == true) {
          block.setPermutation(BlockPermutation.resolve("minecraft:air"));
        } else {
          const item = new ItemStack(`${block.typeId}_item`, 1);
          spawnItemAnywhere(item, block.location, block.dimension);
          block.setPermutation(BlockPermutation.resolve("minecraft:air"));
        }
      }
    },

    onPlayerInteract(data) {
      doorManager.interactWithDoor(data.block);
    },

    beforeOnPlayerPlace(data) {
      const { block, player, dimension, permutationToPlace } = data;
      const loc = block.location;

      if (loc.y + 1 >= dimensionToHeight(dimension.id)) {
        data.cancel = true;
        return;
      }
      let blockAbove: Block | undefined = undefined;
      let blockBelow: Block | undefined = undefined;
      try {
        blockBelow = dimension.getBlock({ x: loc.x, y: loc.y - 1, z: loc.z });
      } catch {}

      if (blockBelow == undefined) {
        data.cancel = true;
        return;
      }

      if (blockBelow.isAir || blockBelow.isLiquid) {
        data.cancel = true;
        return;
      }
      try {
        blockAbove = dimension.getBlock({ x: loc.x, y: loc.y + 1, z: loc.z });
      } catch {}

      if (blockAbove == undefined) {
        data.cancel = true;
        return;
      }
      if (blockAbove?.isAir || blockAbove?.isLiquid) {
        doorManager.placeDoor(block, blockAbove);
      } else {
        data.cancel = true;
        return;
      }
    },

    onPlayerDestroy({ block, destroyedBlockPermutation }) {
      if (destroyedBlockPermutation.hasTag(doorManager.doorTag)) {
        const topHalf = destroyedBlockPermutation.getState("natures_spirit:top_bit");
        const doorPart = !topHalf ? block.above() : block.below();
        if (doorPart?.hasTag("natures_spirit:door")) block.dimension.runCommand(`setblock ${block.location.x} ${block.location.y + (topHalf ? -1 : 1)} ${block.location.z} air destroy`)
      
        const data = `${destroyedBlockPermutation.type.id}_item`;
      
        const item = new ItemStack(data, 1);
        const loc = block.location;
        const itemEntity = block.dimension.spawnItem(item, {
          x: loc.x + 0.5,
          y: loc.y + 0.5 + 100,
          z: loc.z + 0.5,
        });
      
        itemEntity.teleport({ x: loc.x + 0.5, y: loc.y + 0.5, z: loc.z + 0.5 });
        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
      } else {}
    },
  });
});
