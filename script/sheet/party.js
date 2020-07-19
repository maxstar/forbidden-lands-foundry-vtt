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
        let ownedActorId;
        for (let i = 0; i < data.actor.data.partyMembers.length; i++) {
            ownedActorId = data.actor.data.partyMembers[i];
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
        html.find('.item-delete').click(this.handleRemoveMember.bind(this));
    }

    async handleRemoveMember(event) {
        const div = $(event.currentTarget).parents(".party-member");

        let partyMembers = [...this.actor.data.data.partyMembers];
        partyMembers.splice(partyMembers.indexOf(div.data("entity-id")), 1);
        await this.actor.update({'data.partyMembers': partyMembers});

        div.slideUp(200, () => this.render(false));
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

        let partyMembers = [...this.actor.data.data.partyMembers];
        partyMembers.push(draggedItem.id);
        partyMembers = [...new Set(partyMembers)];
        await this.actor.update({'data.partyMembers': partyMembers});
        this.render(true);
    }
}
