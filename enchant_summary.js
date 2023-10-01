// ==UserScript==
// @name     		Inventory, Enchant Summary
// @description Adds a small summary to the inventory screen
// @namespace   https://lyrania.co.uk/game.php
// @include     https://lyrania.co.uk/game.php
// @version     1.0
// @grant       none
// @run-at			document-end
// ==/UserScript==

function enchant_summary() {
  const filters = [
    { 'name': 'Critical Hit Chance', 'tag': 'critical hit chance' },
    { 'name': 'Attack Bonus', 'tag': 'attack boost' },
    { 'name': 'Health Bonus', 'tag': 'health boost' },
    { 'name': 'Accuracy Bonus', 'tag': 'accuracy boost' },
    { 'name': 'Weapon Power', 'tag': 'weapon power ' },
    { 'name': 'Critical Hit Damage', 'tag': 'critical hit damage' },
    { 'name': 'Quest Boost', 'tag': 'quest boost' },
    { 'name': 'Global Boost', 'tag': 'drop boost' },
    { 'name': 'Defence Bonus', 'tag': 'defence boost' },
    { 'name': 'Evasion Bonus', 'tag': 'evasion boost' },
    { 'name': 'Taxonomy Boost', 'tag': 'taxonomy boost' },
    { 'name': 'Stat Drop Boost', 'tag': 'stat drop boost' },
    { 'name': 'Jade Drop Bonus', 'tag': 'jade finds' },
    { 'name': 'Armour Bonus', 'tag': 'armour power' }
    //{'name':'', 'tag':''}
  ]
  let jewels = document.querySelectorAll('#popup span[data-tippy-content]');
  let sorted_enchants = {}

  jewels.forEach(function (jewel) {
    let temp_container = document.createElement('div');
    temp_container.innerHTML = jewel.getAttribute('data-tippy-content');

    let enchants = temp_container.querySelector('table td:nth-of-type(2)').innerHTML.split('<br><br>');

    for (enchant of enchants) {
      for (item of filters) {
        if (!enchant.includes(item.tag))
          continue;

        if (!enchant.includes('%')) {
          // Flat amount based enchants exist
        } else {
          let enchant_bonus = +enchant.match(/Effect: (\d+)%/i)[1];

          if (!sorted_enchants.hasOwnProperty(item.name)) {
            sorted_enchants[item.name] = enchant_bonus;
          } else {
            sorted_enchants[item.name] += enchant_bonus;
          }
        }
      }
    }
  })
  let effect_array = [];
  Object.entries(sorted_enchants).forEach(function ([key, value]) {
    effect_array.push(`
          <span style="display:inline-block; margin: 0 2px 0 2px; width:32%"><i>${key}:</i> 
            <span style="color: green; float:right">+${value}%</span>
          </span>`);
  })

  let summary_ui = document.createElement('tr');
  summary_ui.innerHTML = `
          <td colspan="3">
            <table>
              <tr>
                <td style="width:33%"><hr></td> <td><b>Enchantment Summary</b></td> <td style="width:33%"><hr></td>
              </tr>
              <tr>
                <td colspan="3">${effect_array.join('')}</td>
              </tr>
              <tr>
                <td colspan="3"><hr></td>
              </tr>
            </table>
          </td>`;
  document.querySelector('.equippedItems tbody').appendChild(summary_ui);
}