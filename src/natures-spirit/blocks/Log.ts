import {
  BlockPermutation,
  EntityEquippableComponent,
  EquipmentSlot,
  ItemDurabilityComponent,
  ItemEnchantableComponent,
  ItemStack,
  world,
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("natures_spirit:log", {
    onPlayerInteract({ block, dimension, player }) {
      const equipment = player?.getComponent(
        "equippable"
      ) as EntityEquippableComponent;
      const itemStack = equipment.getEquipment(EquipmentSlot.Mainhand);
      const namespace = block.typeId.split(":")[0];
      const logName = block.typeId.split(":")[1];
      if (itemStack?.typeId.includes("axe") && !logName.includes("stripped_")) {
        const newPermutation = BlockPermutation.resolve(
          namespace + ":stripped_" + logName,
          {
            ...block.permutation.getAllStates(),
          }
        );
        block.setPermutation(newPermutation);

        const itemEnchantmentComp = itemStack.getComponent(
          "minecraft:enchantable"
        ) as ItemEnchantableComponent;
        const unbreakingLevel =
          itemEnchantmentComp?.getEnchantment("unbreaking")?.level ?? 0;
        const breakChance = 100 / (unbreakingLevel + 1);
        const randomizeChance = Math.random() * 100;
        if (breakChance < randomizeChance) return;
        const itemUsedDurabilityComp = itemStack.getComponent("durability") as ItemDurabilityComponent;
        if (!itemUsedDurabilityComp) return;
        itemUsedDurabilityComp.damage += 1;
        const maxDurability = itemUsedDurabilityComp.maxDurability;
        const currentDamage = itemUsedDurabilityComp.damage;
        if (currentDamage >= maxDurability) {
          dimension.playSound("random.break", block.location, {
            pitch: 1,
            volume: 1,
          });
          equipment.setEquipment(EquipmentSlot.Mainhand, new ItemStack("minecraft:air", 1));
        } else;

        equipment.setEquipment(EquipmentSlot.Mainhand, itemStack);
      }
    },
  });
});
