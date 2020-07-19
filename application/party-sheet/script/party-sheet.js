export class PartySheet extends Application {
    partyMembers = {};

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "systems/my-forbidden-lands/application/party-sheet/template/widget.html";
        options.dragDrop = [{ dragSelector: '.party-member', dropSelector: '.party-member-list' }];
        return options;
    }

    getData() {
        return {
            partyMembers: this.partyMembers,
        };
    }

    static showPartySheet(partySheet) {
        console.log('party-sheet | Showing.');

        this.loadSettings();
        let templatePath = "systems/my-forbidden-lands/application/party-sheet/template/widget.html";
        renderTemplate(templatePath, this.getData()).then(html => {
            partySheet.render(true);
        }).then(
            calendar.setPos({ top: 300, left: 300 })
        );
    }

    setPos(pos) {
        return new Promise(resolve => {
            function check() {
                let elmnt = document.getElementById('party-sheet-widget');
                if (elmnt) {
                    elmnt.style.bottom = null;
                    elmnt.style.top = (pos.top) + "px";
                    elmnt.style.left = (pos.left) + "px";
                    elmnt.style.position = 'fixed';
                    elmnt.style.zIndex = 100;
                    resolve();
                } else {
                    setTimeout(check, 30);
                }
            }
            check();
        })
    }

    loadSettings() {
        this.partyMembers = game.settings.get('party-sheet', 'partyMembers');
    }

    updateSettings() {
        if (!game.user.isGM) return;

        game.settings.set("party-sheet", "partyMembers", this.partyMembers);
    }

    //The onDragItemStart event can be subverted to let you package additional data what you're dragging
    _onDragStart(event) {
        console.log('Drag Start');
        console.log(event);
        let itemId = event.currentTarget.getAttribute("data-item-id");
        event.dataTransfer.setData(
            "text/plain",
            JSON.stringify({
                type: "Actor",
                id: itemId,
            })
        );
    }

    async _onDrop(event) {
        console.log("Drop");
        //the ondrop event is what reads the data and lets you modify the target you're dropping it onto
        let draggedItem = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (draggedItem.type !== 'Actor') return;

        console.log(draggedItem);
        const actor = game.actors.get(draggedItem.id);
        this.partyMembers[draggedItem.id] = actor.data;
        this.updateSettings();
    }
}
