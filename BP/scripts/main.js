import { world } from "@minecraft/server";

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

  blockTypeRegistry.registerCustomComponent("natures_spirit:slab", {
    onPlayerInteract(arg) {
      const itemStack = arg.player.getComponent("inventory").container.getItem(arg.player.selectedSlot);
      const block = arg.block;
      const permutation = block.permutation;

      if (itemStack.typeId === block.typeId && !permutation.getState("natures_spirit:double")) {
        const verticalHalfState = permutation.getState("minecraft:vertical_half");

        if (verticalHalfState === "top" && arg.face === "Down") {
          performActions();
        } else if (verticalHalfState === "bottom" && arg.face === "Up") {
          performActions();
        }
      }

      function performActions() {
        block.setPermutation(permutation.withState("natures_spirit:double", true));
        arg.player.runCommand(`gamerule sendcommandfeedback false`);
        arg.player.runCommand(`clear @s ${itemStack.typeId} 0 1`);
        arg.player.runCommand(`playsound use.stone @a ~~~ 1 0.8`);
        arg.player.runCommand(`gamerule sendcommandfeedback true`);
      }
    },
  });
});
