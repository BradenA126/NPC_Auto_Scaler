/**
 * Foundry VTT Module: NPC Auto-Scaler
 * Dynamically adjusts NPC stats based on a set Challenge Rating (1-10 scale)
 */

class NPCScaler {
    constructor(actor) {
        this.actor = actor;
        this.CR_SCALE = {
            1: { hp: 10, ac: 12, attack: 3, proficiency: 2, abilities: [10, 10, 10, 10, 10, 10] },
            2: { hp: 20, ac: 13, attack: 4, proficiency: 2, abilities: [12, 11, 12, 11, 11, 11] },
            3: { hp: 30, ac: 14, attack: 5, proficiency: 2, abilities: [14, 12, 13, 12, 12, 12] },
            4: { hp: 45, ac: 15, attack: 6, proficiency: 3, abilities: [16, 14, 14, 13, 13, 13] },
            5: { hp: 60, ac: 16, attack: 7, proficiency: 3, abilities: [18, 15, 15, 14, 14, 14] },
            6: { hp: 75, ac: 17, attack: 8, proficiency: 4, abilities: [20, 16, 16, 15, 15, 15] },
            7: { hp: 90, ac: 18, attack: 9, proficiency: 4, abilities: [22, 18, 17, 16, 16, 16] },
            8: { hp: 110, ac: 19, attack: 10, proficiency: 5, abilities: [24, 19, 18, 17, 17, 17] },
            9: { hp: 130, ac: 20, attack: 11, proficiency: 5, abilities: [26, 20, 19, 18, 18, 18] },
            10: { hp: 150, ac: 21, attack: 12, proficiency: 6, abilities: [28, 22, 20, 19, 19, 19] }
        };
        this.EQUIPMENT = {
            1: ["Dagger", "Leather Armor"],
            2: ["Shortsword", "Studded Leather Armor"],
            3: ["Mace", "Chain Shirt"],
            4: ["Longsword", "Chain Mail"],
            5: ["Greatsword", "Splint Armor"],
            6: ["Maul", "Plate Armor"],
            7: ["Magic Longsword", "Magical Half Plate"],
            8: ["Magic Greataxe", "Enchanted Plate Armor"],
            9: ["Legendary Weapon", "Adamantine Armor"],
            10: ["Artifact Weapon", "Artifact Armor"]
        };
    }

    applyScaling(cr) {
        if (!this.CR_SCALE[cr]) return;

        let scale = this.CR_SCALE[cr];

        // Adjust core attributes
        this.actor.update({
            "system.attributes.hp.max": scale.hp,
            "system.attributes.ac.value": scale.ac,
            "system.attributes.prof": scale.proficiency,
            "system.abilities.str.value": scale.abilities[0],
            "system.abilities.dex.value": scale.abilities[1],
            "system.abilities.con.value": scale.abilities[2],
            "system.abilities.int.value": scale.abilities[3],
            "system.abilities.wis.value": scale.abilities[4],
            "system.abilities.cha.value": scale.abilities[5]
        });

        // Assign equipment based on CR
        let equipment = this.EQUIPMENT[cr] || [];
        this.actor.update({ "system.items": equipment.map(name => ({ name, type: "equipment" })) });
    }
}

// Foundry VTT Hook
Hooks.on("updateActor", (actor, update, options, userId) => {
    if (actor.type !== "npc") return;
    let cr = actor.getFlag("npc-scaler", "challengeRating");
    if (cr) {
        let scaler = new NPCScaler(actor);
        scaler.applyScaling(cr);
    }
});

// UI Integration
Hooks.on("renderActorSheet", (app, html, data) => {
    if (app.actor.type !== "npc") return;
    
    let crInput = $(`<input type="number" min="1" max="10" value="${app.actor.getFlag("npc-scaler", "challengeRating") || 1}" />`);
    crInput.on("change", function () {
        app.actor.setFlag("npc-scaler", "challengeRating", parseInt(this.value));
        let scaler = new NPCScaler(app.actor);
        scaler.applyScaling(parseInt(this.value));
    });
    
    html.find(".attributes").append(`<div class='form-group'><label>CR Scale</label></div>`).append(crInput);
});
