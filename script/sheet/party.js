import { ForbiddenLandsActor } from "../actor/forbidden-lands.js";
import { TravelActionsConfig } from "../components/travel-actions.js";

export class ForbiddenLandsPartySheet extends ActorSheet {

    dices = [];
    lastTestName = "";
    lastDamage = 0;

    static get defaultOptions() {
        let dragDrop = [...super.defaultOptions.dragDrop];
        dragDrop.push({ dragSelector: '.party-member', dropSelector: '.party-member-list' });
        return mergeObject(super.defaultOptions, {
            classes: ["forbidden-lands", "sheet", "actor"],
            template: "systems/my-forbidden-lands/model/party.html",
            width: 600,
            height: 700,
            resizable: false,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }],
            dragDrop: dragDrop,
        });
    }

    getData() {
        const data = super.getData();

        data.partyMembers = {};
        data.travel = {};
        data.travelActions = TravelActionsConfig;
        let ownedActorId, assignedActorId, travelAction;
        for (let i = 0; i < data.actor.data.partyMembers.length; i++) {
            ownedActorId = data.actor.data.partyMembers[i];
            data.partyMembers[ownedActorId] = game.actors.get(ownedActorId).data;
        }
        for (let travelActionKey in data.actor.data.travel) {
            travelAction = data.actor.data.travel[travelActionKey];
            data.travel[travelActionKey] = {};

            if (typeof travelAction.value === 'object') {
                for (let i = 0; i < travelAction.value.length; i++) {
                    assignedActorId = travelAction.value[i];
                    data.travel[travelActionKey][assignedActorId] = game.actors.get(assignedActorId).data;
                }
            } else if (travelAction.value !== "") {
                data.travel[travelActionKey][travelAction.value] = game.actors.get(travelAction.value).data;
            }
        }
        console.log('getData()');
        console.log(data);
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.item-delete').click(this.handleRemoveMember.bind(this));
        html.find('.reset').click(ev => {
           this.assignPartyMembersToAction(this.actor.data.data.partyMembers, 'other');
           this.render(true);
        });

        let button;
        for(let key in TravelActionsConfig) {
            for (let i = 0; i < TravelActionsConfig[key].buttons.length; i++) {
                button = TravelActionsConfig[key].buttons[i];
                html.find('.' + button.class).click(button.handler.bind(this, this));
            }
        }
    }

    async handleRemoveMember(event) {
        const div = $(event.currentTarget).parents(".party-member");
        const entityId = div.data("entity-id");

        let partyMembers = [...this.actor.data.data.partyMembers];
        partyMembers.splice(partyMembers.indexOf(entityId), 1);

        let updateData = {
            'data.partyMembers': partyMembers,
        };

        let travelAction, actionParticipants;
        for (let travelActionKey in this.actor.data.data.travel) {
            travelAction = this.actor.data.data.travel[travelActionKey];
            if (travelAction.value.indexOf(entityId) < 0) continue;

            if (typeof travelAction.value === 'object') {
                actionParticipants = [...travelAction.value];
                actionParticipants.splice(actionParticipants.indexOf(entityId), 1);
                updateData['data.travel.' + travelActionKey + '.value'] = actionParticipants;
            } else {
                updateData['data.travel.' + travelActionKey + '.value'] = "";
            }
        }

        await this.actor.update(updateData);

        div.slideUp(200, () => this.render(false));
    }

    //The onDragItemStart event can be subverted to let you package additional data what you're dragging
    _onDragStart(event) {
        if (event.currentTarget.dataset.itemId !== undefined) {
            super._onDragStart(event);
            return;
        }

        console.log('Drag Start');
        console.log(event);
        let entityId = event.currentTarget.dataset.entityId;
        console.log(entityId);
        event.dataTransfer.setData(
            "text/plain",
            JSON.stringify({
                type: "Actor",
                action: "assign",
                id: entityId,
            })
        );
    }

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

        if (draggedItem.action === 'assign') {
            this.handleTravelActionAssignment(event, actor);
        } else {
            this.handleAddToParty(actor);
        }
        this.render(true);
    }

    async handleTravelActionAssignment(event, actor) {
        let actionContainer = event.toElement.classList.contains('travel-action') ? event.toElement : event.toElement.closest('.travel-action');
        if (actionContainer === null) return; // character was dragged god knows where; just pretend it never happened

        this.assignPartyMembersToAction(actor, actionContainer.dataset.travelAction);
    }

    async assignPartyMembersToAction(partyMembers, travelActionKey) {
        if (!Array.isArray(partyMembers)) partyMembers = [partyMembers];

        let updateData = {}, updDataKey, partyMemberId;
        for (let i = 0; i < partyMembers.length; i++) {
            partyMemberId = typeof partyMembers[i] === 'object' ? partyMembers[i].data._id : partyMembers[i];
            console.log('Assigning ' + partyMemberId + ' to ' + travelActionKey);
    
            // remove party member from the current assignment
            let travelAction, actionParticipants;
            for (let key in this.actor.data.data.travel) {
                travelAction = this.actor.data.data.travel[key];
                if (travelAction.value.indexOf(partyMemberId) < 0) continue;
    
                updDataKey = 'data.travel.' + key + '.value';
                if (typeof travelAction.value === 'object') {
                    if (updateData[updDataKey] === undefined) {
                        actionParticipants = [...travelAction.value];
                        actionParticipants.splice(actionParticipants.indexOf(partyMemberId), 1);
                        updateData[updDataKey] = actionParticipants;
                    } else {
                        updateData[updDataKey].splice(updateData[updDataKey].indexOf(partyMemberId), 1);
                    }
                } else {
                    updateData[updDataKey] = "";
                }
            }
    
            // add party member to a new assignment
            updDataKey = 'data.travel.' + travelActionKey + '.value';
            if (typeof this.actor.data.data.travel[travelActionKey].value === 'object') {
                if (updateData[updDataKey] === undefined) {
                    actionParticipants = [...this.actor.data.data.travel[travelActionKey].value];
                    actionParticipants.push(partyMemberId);
                    updateData[updDataKey] = actionParticipants;
                } else {
                    updateData[updDataKey].push(partyMemberId);
                }
            } else {
                updateData[updDataKey] = partyMemberId;
                // if someone was already assigned here we must move that character to the "Other" assignment
                if (this.actor.data.data.travel[travelActionKey].value !== "") {
                    if (updateData['data.travel.other.value'] === undefined) {
                        actionParticipants = [...this.actor.data.data.travel.other.value];
                        actionParticipants.push(this.actor.data.data.travel[travelActionKey].value);
                        updateData['data.travel.other.value'] = actionParticipants;
                    } else {
                        updateData['data.travel.other.value'].push(this.actor.data.data.travel[travelActionKey].value);
                    }
                }
            }
        }

        await this.actor.update(updateData);
    }

    async handleAddToParty(actor) {
        let partyMembers = [...this.actor.data.data.partyMembers];
        let initialCount = partyMembers.length;
        partyMembers.push(actor.data._id);
        partyMembers = [...new Set(partyMembers)];
        if (initialCount === partyMembers.length) return; // nothing changed

        let travelOther = [...this.actor.data.data.travel.other.value];
        travelOther.push(actor.data._id);
        await this.actor.update({ 'data.partyMembers': partyMembers, 'data.travel.other.value': travelOther });
    }
}
