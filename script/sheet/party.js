import {ForbiddenLandsActor} from "../actor/forbidden-lands.js";

export class ForbiddenLandsPartySheet extends ActorSheet {

    dices = [];
    lastTestName = "";
    lastDamage = 0;

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["forbidden-lands", "sheet", "actor"],
            template: "systems/my-forbidden-lands/model/party.html",
            width: 600,
            height: 700,
            resizable: false,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }],
        });
    }

    getData() {
        const data = super.getData();

        data.partyMembers = {};
        for (let ownedActorId in data.actor.data.partyMembers.value) {
            data.partyMembers[ownedActorId] = game.actors.get(ownedActorId).data;
        }
        console.log('getData()');
        console.log(data);
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        // html.find('.item-create').click(ev => {
        //     this.onItemCreate(ev)
        // });
    }

    //The onDragItemStart event can be subverted to let you package additional data what you're dragging
    // _onDragStart(event) {
    //     console.log('Drag Start');
    //     console.log(event);
    //     let itemId = event.currentTarget.getAttribute("data-item-id");
    //     event.dataTransfer.setData(
    //         "text/plain",
    //         JSON.stringify({
    //             type: "Actor",
    //             id: itemId,
    //         })
    //     );
    // }

    async _onDrop(event) {
        super._onDrop(event);

        console.log("Drop");
        //the ondrop event is what reads the data and lets you modify the target you're dropping it onto
        let draggedItem = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (draggedItem.type !== 'Actor') return;

        console.log(draggedItem);
        const actor = game.actors.get(draggedItem.id);

        if (actor.data.type !== 'character') return;

        console.log('Dropped actor:');
        console.log(actor.data);
        console.log('Party actor:');
        console.log(this.actor.data);

        let partyMembers = Object.assign({}, this.actor.data.data.partyMembers.value);
        partyMembers[draggedItem.id] = draggedItem.id;
        await this.actor.update({'data.partyMembers.value': partyMembers});
        this.render(true);
    }
}
