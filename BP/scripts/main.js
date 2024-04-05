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
});
