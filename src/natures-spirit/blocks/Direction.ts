import {
  world,
} from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "natures_spirit:block_face_2",
    {
      beforeOnPlayerPlace(arg) {
        const face = arg.face;
        arg.permutationToPlace = arg.permutationToPlace.withState(
          "natures_spirit:hanging",
          face === "Down"
        );
      },
    }
  );

  blockComponentRegistry.registerCustomComponent(
    "natures_spirit:block_face_3",
    {
      beforeOnPlayerPlace(arg) {
        // const face = arg.face;

        // const Faces = {
        //   ["Up"]: 0,
        //   ["Down"]: 0,
        //   ["North"]: 1,
        //   ["South"]: 1,
        //   ["West"]: 2,
        //   ["East"]: 2,
        // };

        // arg.permutationToPlace = arg.permutationToPlace.withState(
        //   "natures_spirit:block_face",
        //   Faces[face]
        // );

        let face = arg.face;
        switch (face) {
          case "Up":
          case "Down":
            arg.permutationToPlace = arg.permutationToPlace.withState(
              "natures_spirit:block_face",
              0
            );
            break;
          case "North":
          case "South":
            arg.permutationToPlace = arg.permutationToPlace.withState(
              "natures_spirit:block_face",
              1
            );
            break;
          case "West":
          case "East":
            arg.permutationToPlace = arg.permutationToPlace.withState(
              "natures_spirit:block_face",
              2
            );
            break;
        }
      },
    }
  );
});
