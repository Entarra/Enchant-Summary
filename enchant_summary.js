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
    { 'name': 'Critical-Hit Chance', 'tag': 'critical hit chance' },
    { 'name': 'Attack', 'tag': 'attack boost' },
    { 'name': 'Health', 'tag': 'health boost' },
    { 'name': 'Accuracy', 'tag': 'accuracy boost' },
    { 'name': 'Weapon Power', 'tag': 'weapon power ' },
    { 'name': 'Critical-Hit Damage', 'tag': 'critical hit damage' },
    { 'name': 'Quest Boost', 'tag': 'quest boost' },
    { 'name': 'Global Boost', 'tag': 'drop boost' },
    { 'name': 'Defence', 'tag': 'defence boost' },
    { 'name': 'Evasion', 'tag': 'evasion boost' },
    { 'name': 'Taxonomy Boost', 'tag': 'taxonomy boost' },
    { 'name': 'Stat Drop Boost', 'tag': 'stat drop boost' },
    { 'name': 'Jade Drop', 'tag': 'jade finds' },
    { 'name': 'Jack of all Jades', 'tag': 'jack of all jades' },
    { 'name': 'Armour Power', 'tag': 'armour power' }
  ]
  let jewels = document.querySelectorAll('#popup span[data-tippy-content]');
  let sorted_enchants = {}

  jewels.forEach(function (jewel) {
    let temp_container = document.createElement('div');
    temp_container.innerHTML = jewel.getAttribute('data-tippy-content');
    let enchants = temp_container.querySelector('table td:nth-of-type(2)').innerHTML.split('<br><br>');

    for (let enchant of enchants) {
      for (let item of filters) {
        if (!enchant.includes(item.tag))
          continue;

        if (!enchant.includes('%')) {
          // Flat amount based enchants exist
        } else {
          let enchant_effect = +enchant.match(/Effect: (\d+)%/i)[1];
          if (!sorted_enchants.hasOwnProperty(item.name))
            sorted_enchants[item.name] = 0;

          sorted_enchants[item.name] += enchant_effect;
        }
      }
    }
  })

  let effect_array = [];
  Object.entries(sorted_enchants).forEach(function ([key, value]) {
    effect_array.push(`
          <span style="display:inline-block; margin: 0 2px 0 2px; width:32%"><i>${key}:</i> 
            <span class="text-success" style="float:right">+${value}%</span>
          </span>`);
  })

  let summary_ui;
  if (!document.querySelector('#enchantment-summary')) {
    summary_ui = document.createElement('tr')
    summary_ui.setAttribute('id', 'enchantment-summary');

    document.querySelector('.equippedItems tbody').appendChild(summary_ui);
  } else {
    summary_ui = document.querySelector('#enchantment-summary');
  }
  summary_ui.innerHTML = `
      <td colspan="3">
        <table>
          <tr>
            <td style="width:33%"><hr></td> <td><b>Enchantment Bonuses</b></td> <td style="width:33%"><hr></td>
          </tr>
          <tr>
            <td colspan="3">${effect_array.join('')}</td>
          </tr>
          <tr>
            <td colspan="3"><hr style="margin:6px 6px 0 6px"></td>
          </tr>
        </table>
      </td>`;
}

(function set_observer() {
  if (document.querySelector('#popup')) {
    var Inventory_observer = new MutationObserver(function (mutations) {
      if (document.querySelector('#popup'))
        if (document.querySelector('#popup').textContent.includes('Equipped Jewels'))
          enchant_summary();
    });
    Inventory_observer.observe(document.querySelector("#popup"), {
      childList: true
    });
  } else {
    window.setTimeout(set_observer, 100);
  }
})();