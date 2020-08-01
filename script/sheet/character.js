import { ForbiddenLandsActorSheet } from "./actor.js";

export class ForbiddenLandsCharacterSheet extends ForbiddenLandsActorSheet {
  dices = [];
  lastTestName = "";
  lastDamage = 0;

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["forbidden-lands", "sheet", "actor"],
      template: "systems/forbidden-lands/model/character.html",
      width: 620,
      height: 740,
      resizable: false,
      scrollY: [
        ".armors .item-list .items",
        ".critical-injuries .item-list .items",
        ".gears.item-list .items",
        ".spells .item-list .items",
        ".talents .item-list .items",
        ".weapons .item-list .items",
      ],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
    });
  }

  getData() {
    const data = super.getData();
    this.computeSkills(data);
    this.computeItems(data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".item-create").click((ev) => {
      this.onItemCreate(ev);
    });
    html.find(".condition").click(async (ev) => {
      const conditionName = $(ev.currentTarget).data("condition");
      const conditionValue = this.actor.data.data.condition[conditionName].value;
      if (conditionName === "sleepy") {
        this.actor.update({"data.condition.sleepy.value": !conditionValue,});
      } else if (conditionName === "thirsty") {
        this.actor.update({ "data.condition.thirsty.value": !conditionValue });
      } else if (conditionName === "hungry") {
        this.actor.update({ "data.condition.hungry.value": !conditionValue });
      } else if (conditionName === "cold") {
        this.actor.update({ "data.condition.cold.value": !conditionValue });
      }
      this._render();
    });
    html.find(".roll-armor.specific").click((ev) => {
      const itemId = $(ev.currentTarget).data("itemId");
      const armor = this.actor.getOwnedItem(itemId);
      let testName = armor.data.name;
      let base;
      let skill;
      if (armor.data.data.part === 'shield') {
        base = this.actor.data.data.attribute.strength.value;
        skill = this.actor.data.data.skill.melee.value;
      } else {
        base = 0;
        skill = 0;
      }
      this.prepareRollDialog(testName, base, skill, armor.data.data.bonus.value, "", 0, 0);
    });
    html.find(".roll-armor.total").click((ev) => {
      let armorTotal = 0;
      const items = this.actor.items;
      items.forEach((item) => {
        if (item.type === "armor" && item.data.data.part !== 'shield') {
          armorTotal += parseInt(item.data.data.bonus.value, 10);
        }
      });
      let testName = game.i18n.localize("HEADER.ARMOR").toUpperCase();
      this.prepareRollDialog(testName, 0, 0, armorTotal, "", 0, 0);
    });
    html.find(".roll-consumable").click((ev) => {
      const consumableName = $(ev.currentTarget).data("consumable");
      const consumable = this.actor.data.data.consumable[consumableName];
      this.rollConsumable(consumable);
    });
  }

  computeSkills(data) {
    for (let skill of Object.values(data.data.skill)) {
      skill.hasStrength = skill.attribute === "strength";
      skill.hasAgility = skill.attribute === "agility";
      skill.hasWits = skill.attribute === "wits";
      skill.hasEmpathy = skill.attribute === "empathy";
    }
  }

  computeItems(data) {
    for (let item of Object.values(data.items)) {
      item.isTalent = item.type === "talent";
      item.isWeapon = item.type === "weapon";
      item.isArmor = item.type === "armor";
      item.isGear = item.type === "gear";
      item.isRawMaterial = item.type === "rawMaterial";
      item.isSpell = item.type === "spell";
      item.isCriticalInjury = item.type === "criticalInjury";
    }
  }

  onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = duplicate(header.dataset);
    data["name"] = `New ${data.type.capitalize()}`;
    this.actor.createEmbeddedEntity("OwnedItem", data, { renderSheet: true });
  }

  push() {
    this.dices.forEach((dice) => {
      if ((dice.value < 6 && dice.value > 1 && dice.type !== "skill") || (dice.value < 6 && ["artifact", "skill"].includes(dice.type))) {
        let die = new Die(dice.face);
        die.roll(1);
        dice.value = die.total;
        let successAndWeight = this.getSuccessAndWeight(dice.value, dice.type);
        dice.success = successAndWeight.success;
        dice.weight = successAndWeight.weight;
      }
    });
    this.sendRollToChat(true);
  }

  async rollConsumable(consumable) {
    let consumableName = game.i18n.localize(consumable.label);
    let result;
    if (!consumable.value) {
      result = "FAILED";
    } else {
      let die = new Die(consumable.value);
      die.roll(1);
      if (die.total > 2) {
        result = "SUCCEED";
      } else {
        result = "FAILED";
      }
    }
    let consumableData = {
      name: consumableName,
      result: game.i18n.localize(result)
    }
    const html = await renderTemplate("systems/forbidden-lands/chat/consumable.html", consumableData);
    let chatData = {
      user: game.user._id,
      rollMode: game.settings.get("core", "rollMode"),
      content: html,
    };
    if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
      chatData.whisper = ChatMessage.getWhisperIDs("GM");
    } else if (chatData.rollMode === "selfroll") {
      chatData.whisper = [game.user];
    }
    ChatMessage.create(chatData);
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    if (this.actor.owner) {
      buttons = [
        {
          label: "Roll",
          class: "custom-roll",
          icon: "fas fa-dice",
          onclick: (ev) => this.prepareRollDialog("Roll", 0, 0, 0, "", 0, 0),
        },
        {
          label: "Push",
          class: "push-roll",
          icon: "fas fa-skull",
          onclick: (ev) => this.push(),
        },
      ].concat(buttons);
    }

    return buttons;
  }
}
