export class ForbiddenLandsMonsterTalentSheet extends ItemSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["forbidden-lands", "sheet", "item"],
            template: "systems/my-forbidden-lands/model/monster-talent.html",
            width: 400,
            height: 420,
            resizable: false
        });
    }

    getData() {
        const data = super.getData();
        return data;
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        buttons = [
            {
                label: "Post Item",
                class: "item-post",
                icon: "fas fa-comment",
                onclick: (ev) => this.item.sendToChat(),
            }
        ].concat(buttons);
        return buttons;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
