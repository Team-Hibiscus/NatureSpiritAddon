import {
  EntityComponentTypes,
  EntityEquippableComponent,
  EquipmentSlot,
  world,
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("natures_spirit:slab", {
    onPlayerInteract({ player, face, block, dimension }) {
      const equipment = player?.getComponent(
        EntityComponentTypes.Equippable
      ) as EntityEquippableComponent;
      const itemStack = equipment.getEquipment(EquipmentSlot.Mainhand);

      if (!itemStack) return;

      const permutation = block.permutation;

      if (
        itemStack.typeId === block.typeId &&
        !permutation.getState("natures_spirit:double")
      ) {
        const verticalHalfState = permutation.getState(
          "minecraft:vertical_half"
        );
        const isBottomUp = verticalHalfState === "bottom" && face === "Up";
        const isTopDown = verticalHalfState === "top" && face === "Down";

        if (isBottomUp || isTopDown) {
          if (player?.getGameMode() !== "creative") {
            itemStack.amount -= 1;
            equipment.setEquipment(
              EquipmentSlot.Mainhand,
              itemStack.amount === 0 ? undefined : itemStack
            );
          }
          block.setPermutation(
            permutation.withState("natures_spirit:double", true)
          );
          const sound = block.hasTag("slab_wood") ? "use.wood" : "use.stone";
          dimension.playSound(sound, block.location);
        }
      }
    },
  });
});
