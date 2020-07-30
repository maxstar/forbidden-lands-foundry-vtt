function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/my-forbidden-lands/chat/item.html",
    "systems/my-forbidden-lands/chat/roll.html",
    "systems/my-forbidden-lands/chat/consumable.html",
    "systems/my-forbidden-lands/model/character.html",
    "systems/my-forbidden-lands/model/monster.html",
    "systems/my-forbidden-lands/model/weapon.html",
    "systems/my-forbidden-lands/model/armor.html",
    "systems/my-forbidden-lands/model/monster-talent.html",
    "systems/my-forbidden-lands/model/monster-attack.html",
    "systems/my-forbidden-lands/model/gear.html",
    "systems/my-forbidden-lands/model/raw-material.html",
    "systems/my-forbidden-lands/model/talent.html",
    "systems/my-forbidden-lands/model/spell.html",
    "systems/my-forbidden-lands/model/critical-injury.html",
    "systems/my-forbidden-lands/model/tab/main.html",
    "systems/my-forbidden-lands/model/tab/combat.html",
    "systems/my-forbidden-lands/model/tab/combat-monster.html",
    "systems/my-forbidden-lands/model/tab/talent.html",
    "systems/my-forbidden-lands/model/tab/spell.html",
    "systems/my-forbidden-lands/model/tab/gear.html",
    "systems/my-forbidden-lands/model/tab/gear-monster.html",
    "systems/my-forbidden-lands/model/tab/bio.html",
    "systems/my-forbidden-lands/model/tab/building-stronghold.html",
    "systems/my-forbidden-lands/model/tab/hireling-stronghold.html",
    "systems/my-forbidden-lands/model/tab/gear-stronghold.html",
    "systems/my-forbidden-lands/model/tab/party/main.html",
    "systems/my-forbidden-lands/model/tab/party/travel.html",
    "systems/my-forbidden-lands/model/tab/party/travel-action.html",
    "systems/my-forbidden-lands/model/tab/party/party-member.html",
  ];
  return loadTemplates(templatePaths);
}

function registerHandlebarsHelpers() {
  Handlebars.registerHelper("skulls", function (current, max, block) {
    var acc = "";
    for (var i = 0; i < max; ++i) {
      block.data.index = i;
      block.data.damaged = i >= current;
      acc += block.fn(this);
    }
    return acc;
  });
  Handlebars.registerHelper("armorPart", function (part) {
    part = normalize(part, "body");
    switch (part) {
      case "body":
        return game.i18n.localize("ARMOR.BODY");
      case "helmet":
        return game.i18n.localize("ARMOR.HELMET");
      case "shield":
        return game.i18n.localize("ARMOR.SHIELD");
    }
  });
  Handlebars.registerHelper("itemWeight", function (weight) {
    weight = normalize(weight, "regular");
    switch (weight) {
      case "tiny":
        return game.i18n.localize("WEIGHT.TINY");
      case "light":
        return game.i18n.localize("WEIGHT.LIGHT");
      case "regular":
        return game.i18n.localize("WEIGHT.REGULAR");
      case "heavy":
        return game.i18n.localize("WEIGHT.HEAVY");
    }
  });
  Handlebars.registerHelper("weaponCategory", function (category) {
    category = normalize(category, "melee");
    switch (category) {
      case "melee":
        return game.i18n.localize("WEAPON.MELEE");
      case "ranged":
        return game.i18n.localize("WEAPON.RANGED");
    }
  });
  Handlebars.registerHelper("weaponGrip", function (grip) {
    grip = normalize(grip, "1h");
    switch (grip) {
      case "1h":
        return game.i18n.localize("WEAPON.1H");
      case "2h":
        return game.i18n.localize("WEAPON.2H");
    }
  });
  Handlebars.registerHelper("weaponRange", function (range) {
    range = normalize(range, "arm");
    switch (range) {
      case "arm":
        return game.i18n.localize("RANGE.ARM");
      case "near":
        return game.i18n.localize("RANGE.NEAR");
      case "short":
        return game.i18n.localize("RANGE.SHORT");
      case "long":
        return game.i18n.localize("RANGE.LONG");
      case "distant":
        return game.i18n.localize("RANGE.DISTANT");
    }
  });
  Handlebars.registerHelper("isBroken", function (item) {
    if (parseInt(item.data.bonus.max, 10) > 0 && parseInt(item.data.bonus.value, 10) === 0) {
      return "broken";
    } else {
      return "";
    }
  });

  Handlebars.registerHelper('toUpperCase', function(value, options) {
      return typeof value === 'string' ? value.toUpperCase() : value;
  });
  Handlebars.registerHelper('capitalize', function(value, options) {
      return typeof value === 'string' && value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
  });
  Handlebars.registerHelper('strconcat', function() {
      const args = Array.prototype.slice.call(arguments);
      args.pop(); // remove unrelated data
      return args.join("");
  });
  
  Handlebars.registerHelper('enrich', function(content) {
    // Enrich the content
    content = TextEditor.enrichHTML(content, {entities: true});
    return new Handlebars.SafeString(content);
  });
}

function normalize(data, defaultValue) {
  if (data) {
    return data.toLowerCase();
  } else {
    return defaultValue;
  }
}

export const initializeHandlebars = () => {
  registerHandlebarsHelpers();
  preloadHandlebarsTemplates();
};
