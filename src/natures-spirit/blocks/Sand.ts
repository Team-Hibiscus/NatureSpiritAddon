import { world, system, BlockPermutation, ItemStack, Block, Vector3 } from "@minecraft/server";

const fallingBlocks = [
  {
    identifier: "custom:sand_block",
    entity: "custom:sand_entity",
    item: "custom:sand_block",
    particle: "custom:sand_block_particle",
    sound: {
      name: "dig.sand",
      volume: 100,
      pitch: 1,
    },
  },
  {
    identifier: "custom:concrete_powder",
    entity: "custom:concrete_powder_entity",
    item: "custom:concrete_powder",
    particle: "custom:concrete_powder_particle",
    sound: "dig.gravel",
    type: "concrete_powder",
    inWaterBlock: "minecraft:white_concrete",
  },
  {
    identifier: "custom:layer_block",
    entity: "custom:layer_entity",
    type: "layers",
    maxLayers: 8,
    layerState: "custom:layer_state",
    layerProperty: "falling_block:layers",
  },
];

world.beforeEvents.worldInitialize.subscribe((initEvent) => {
  initEvent.blockComponentRegistry.registerCustomComponent("natures_spirit:sand", {
    beforeOnPlayerPlace: (e) => {
      const { block } = e;
      system.run(() => {
        if (e.permutationToPlace.hasTag("natures_spirit:sand"))
          checkBlocksToFall(block, `${e.permutationToPlace.type.id}`, `${e.permutationToPlace.type.id}`);
      });
    },
  });
});

world.afterEvents.playerBreakBlock.subscribe(({ player, block }) => {
  if (block.above()?.hasTag("natures_spirit:sand")) {
    checkBlocksToFall(block.above() as Block, `${block.above()?.typeId}`, `${block.above()?.typeId}`);
  } else if (block.above(2)?.hasTag("natures_spirit:sand")) {
    checkBlocksToFall(block.above() as Block, `${block.above()?.typeId}`, `${block.above()?.typeId}`);
  }
});

world.afterEvents.explosion.subscribe((data) => {
  data.getImpactedBlocks().forEach((block) => {
    if (block.hasTag("natures_spirit:sand")) {
      system.run(() => {
        checkBlocksAroundToFall(block, `${block.typeId}`, `${block.typeId}`);
      });
    }
  });
});

world.afterEvents.pistonActivate.subscribe(({ piston, block }) => {
  const locations = piston.getAttachedBlocksLocations();
  for (const loc of locations) {
    const aBlock = block.dimension.getBlock({ x: loc.x, y: loc.y, z: loc.z });
    system.runTimeout(() => {
      if (aBlock?.hasTag("natures_spirit:sand")) {
        checkBlocksAroundToFall(aBlock, `${aBlock.typeId}`, `${aBlock.typeId}`);
      }
    }, 7);
  }
  const facingDirection = piston.block.permutation.getState("facing_direction");
  system.runTimeout(() => {
    if (facingDirection == 1) {
      const fBlock = piston.block.dimension.getBlock(piston.block.offset({ x: 0, y: 1, z: 0 }) as Vector3);
      if (fBlock?.hasTag("natures_spirit:sand")) {
        checkBlocksAroundToFall(fBlock, `${fBlock.typeId}`, `${fBlock.typeId}`);
      }
    }
  }, 7);
});

system.afterEvents.scriptEventReceive.subscribe(({ id, message, sourceEntity: entity }) => {
  if (id === "id:turn_into_block") {
    if (!entity?.isValid()) return;
    const block: Block | undefined = entity?.dimension.getBlock(entity?.location);
    let item: ItemStack | undefined = undefined;
    item = new ItemStack(`${block?.typeId}`);

    if (blockList.includes(block?.typeId as string) || block?.hasTag("minecraft:crop")) {
      block?.setPermutation(BlockPermutation.resolve(`${entity.typeId}`));
      entity?.remove();
    } else {
      dropFallingEntity(entity, item);
    }
  }
});

export function checkBlocksToFall(block: Block, fallingBlock: string, fallingEntity: string) {
  if (!block.hasTag("natures_spirit:sand") || !blockList.includes(block.below()?.typeId as string)) return;
  if (block.typeId === `${fallingBlock}`) {
    if (block.above()?.hasTag("natures_spirit:sand")) {
      forceBlocksToFall(block.above(), `${block.above()?.typeId}`, `${block.above()?.typeId}`);
    }
    if (block.hasTag("natures_spirit:sand")) {
      block.setPermutation(BlockPermutation.resolve("minecraft:air"));
      block.dimension.spawnEntity(`${fallingEntity}`, {
        x: block.location.x + 0.5,
        y: block.location.y,
        z: block.location.z + 0.5,
      });
    }
  }
}

export function checkBlocksAroundToFall(block: Block, fallingBlock: string, fallingEntity: string) {
  checkBlocksToFall(block.above() as Block, `${fallingBlock}`, `${fallingEntity}`);
  checkBlocksToFall(block.north() as Block, `${fallingBlock}`, `${fallingEntity}`);
  checkBlocksToFall(block.south() as Block, `${fallingBlock}`, `${fallingEntity}`);
  checkBlocksToFall(block.east() as Block, `${fallingBlock}`, `${fallingEntity}`);
  checkBlocksToFall(block.west() as Block, `${fallingBlock}`, `${fallingEntity}`);
}

export function forceBlocksToFall(block: Block | undefined, fallingBlock: string, fallingEntity: string) {
  system.runTimeout(() => {
    if (block?.typeId !== `${fallingBlock}`) return;
    if (block.above()?.hasTag("natures_spirit:sand")) {
      forceBlocksToFall(block.above(), `${block.above()?.typeId}`, `${block.above()?.typeId}`);
    }
    if (block.hasTag("natures_spirit:sand") && block.typeId === `${fallingBlock}`) {
      block.setPermutation(BlockPermutation.resolve("minecraft:air"));
      block.dimension.spawnEntity(`${fallingEntity}`, {
        x: block.location.x + 0.5,
        y: block.location.y,
        z: block.location.z + 0.5,
      });
    }
  }, 5);
}

export function dropFallingEntity(entity, item) {
  if (item !== undefined) {
    entity?.dimension.spawnItem(item, { x: entity?.location.x, y: entity?.location.y + 0.5, z: entity?.location.z });
  }
  entity?.dimension.spawnParticle(`${entity.typeId}_particle`, {
    x: entity?.location.x,
    y: entity?.location.y + 0.5,
    z: entity?.location.z,
  });

  entity?.runCommandAsync(`playsound dig.sand @a ~~~ 1 1`);

  entity?.remove();
}

export const blockList = [
  "minecraft:air",
  "minecraft:water",
  "minecraft:flowing_water",
  "minecraft:lava",
  "minecraft:flowing_lava",
  "minecraft:fire",
  "minecraft:vine",
  "minecraft:glow_lichen",
  "minecraft:deadbush",
  "minecraft:short_grass",
  "minecraft:tall_grass",
  "minecraft:large_fern",
  "minecraft:fern",
  "minecraft:kelp",
  "minecraft:seagrass",
  "minecraft:warped_roots",
  "minecraft:crimson_roots",
  "minecraft:nether_sprouts",
];
