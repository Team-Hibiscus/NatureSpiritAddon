import { BlockPermutation, world } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("natures_spirit:trapdoor", {
    onPlayerInteract({ block, dimension }) {
      const currentState = block.permutation.getState("natures_spirit:open");
      const newOpenState = !currentState;
      const newPermutation = BlockPermutation.resolve(block.typeId, {
        ...block.permutation.getAllStates(),
        "natures_spirit:open": newOpenState,
      });
      block.setPermutation(newPermutation);
      const sound = currentState
        ? "open.wooden_trapdoor"
        : "close.wooden_trapdoor";
      dimension.playSound(sound, block.location);
    },
  });
});
