import { BlockPermutation, world } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("natures_spirit:fence_gate", {
    onPlayerInteract({ block, dimension }) {
      const currentState = block.permutation.getState("natures_spirit:open");
      const newOpenState = !currentState;
      const newPermutation = BlockPermutation.resolve(block.typeId, {
        ...block.permutation.getAllStates(),
        "natures_spirit:open": newOpenState,
      });
      block.setPermutation(newPermutation);
      const sound = currentState ? "open.fence_gate" : "close.fence_gate";
      dimension.playSound(sound, block.location);
    },
  });
});