export const registerPartySheetSettings = function(partySheet) {
    game.settings.register('party-sheet', 'partyMembers', {
      name: "Party Members",
      scope: 'world',
      config: false,
      type: Object
    });
};