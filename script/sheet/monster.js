import { ForbiddenLandsActorSheet } from "./actor.js";

export class ForbiddenLandsMonsterSheet extends ForbiddenLandsActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["forbidden-lands", "sheet", "actor"],
      template: "systems/forbidden-lands/model/monster.html",
      width: 620,
      height: 740,
      resizable: false,
      scrollY: [".monster-talents .item-list .items", ".monster-attacks .item-list .items", ".gears.item-list .items"],
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
    html.find(".roll-armor").click((ev) => {
      let armorValue = this.actor.data.data.armor.value;
      let testName = game.i18n.localize("HEADER.ARMOR").toUpperCase();
      this.prepareRollDialog(testName, 0, 0, armorValue, "", 0, 0);
    });
    html.find(".roll-attack").click((ev) => {
      const itemId = $(ev.currentTarget).data("itemId");
      const weapon = this.actor.getOwnedItem(itemId);
      let testName = weapon.name;
      this.prepareRollDialog(testName, weapon.data.data.dice, 0, 0, "", 0, weapon.data.data.damage);
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
      item.isMonsterAttack = item.type === "monsterAttack";
      item.isMonsterTalent = item.type === "monsterTalent";
      item.isWeapon = item.type === "weapon";
      item.isArmor = item.type === "armor";
      item.isGear = item.type === "gear";
      item.isRawMaterial = item.type === "rawMaterial";
    }
  }

  onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = duplicate(header.dataset);
    data["name"] = `New ${data.type.capitalize()}`;
    this.actor.createEmbeddedEntity("OwnedItem", data, { renderSheet: true });
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
      ].concat(buttons);
    }

    return buttons;
  }
}
