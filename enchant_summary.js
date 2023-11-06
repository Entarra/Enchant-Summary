// ==UserScript==
// @name     		Inventory, Enchant Summary
// @description Adds a small summary to the inventory screen
// @namespace   https://lyrania.co.uk/game.php
// @match       https://lyrania.co.uk/game.php
// @version     0.9.2
// @grant       none
// @run-at			document-end
// ==/UserScript==

/* == TODO ==
  - Summary of equipped stats
  - Tooltips for each type of enchantment effect
    - Show their best and worst enchant from this type
    - Show how close they are to perfect
*/

const enchantments = [
  { 'type': 'Accuracy', 'phrase': '% accuracy', 'max_value': 12 },
  { 'type': 'Attack', 'phrase': '% attack', 'max_value': 12 },
  { 'type': 'Defence', 'phrase': '% defence', 'max_value': 12 },
  { 'type': 'Evasion', 'phrase': '% evasion', 'max_value': 12 },
  { 'type': 'Health', 'phrase': '% health', 'max_value': 10 },
  { 'type': 'Heroism', 'phrase': '% to your heroism', 'max_value': 125 },
  { 'type': '% Armour Power', 'phrase': 'armour power by effect%', 'max_value': 12 },
  { 'type': 'Armour Power', 'phrase': 'armour power by effect amount', 'max_value': 200000 },
  { 'type': '% Weapon Power', 'phrase': 'weapon power by effect%', 'max_value': 12 },
  { 'type': 'Weapon Power', 'phrase': 'weapon power by effect amount', 'max_value': 200000 },
  { 'type': 'Critical-Hit Chance', 'phrase': 'critical hit chance', 'max_value': 50 },
  { 'type': 'Critical-Hit Damage', 'phrase': 'critical hit damage', 'max_value': 50 },
  { 'type': 'Stat-Drop Boost', 'phrase': '% stat drop', 'max_value': 125 },
  { 'type': 'Quest Boost', 'phrase': '% quest', 'max_value': 125 },
  { 'type': 'Global-Drop Boost', 'phrase': '% drop boost', 'max_value': 125 },
  { 'type': 'Jade-Drop Boost', 'phrase': '% to global jade', 'max_value': 70 },
  { 'type': 'Gold Boost', 'phrase': '% to global gold', 'max_value': 125 },
  { 'type': 'Jack Of All Jades', 'phrase': '% jack of all jades', 'max_value': 2 },
  { 'type': 'Dungeon Mastery', 'phrase': '% dungeon mastery', 'max_value': 2 },
  { 'type': 'Areaboss Taxonomy', 'phrase': '% area boss', 'max_value': 15 }
];

let toggles = {
  'show_stats': true,
  'show_enchant_tooltip': true
}

if (!localStorage.data_enchant_summary)
  localStorage.data_enchant_summary = JSON.stringify(toggles);
toggles = JSON.parse(localStorage.data_enchant_summary);

function set_toggle(toggle, state) {
  if (toggles.hasOwnProperty(toggle))
    toggles[toggle] = state;

  localStorage.data_enchant_summary = JSON.stringify(toggles)
}

function summarize() {
  // == Data gathering
  let stat_types = [];
  let jewels = document.querySelectorAll('#popup span[data-tippy-content]');
  let collection = { 'stats': {}, 'enchantments': {} }

  jewels.forEach(function (jewel) {
    let temp_container = document.createElement('div');
    temp_container.innerHTML = jewel.getAttribute('data-tippy-content');

    let jewel_stats = temp_container.querySelector('table td:nth-of-type(1)').innerHTML.split('</div><div');
    for (let entry of jewel_stats) {
      let match = entry.match(/([0-9-]+) (\w+)/i);

      if (!collection.stats.hasOwnProperty(match[2]))
        collection.stats[match[2]] = 0;
      collection.stats[match[2]] += +match[1];
    }

    let jewel_enchants = temp_container.querySelector('table td:nth-of-type(2)').innerHTML.split('<br><br>');
    for (let entry of jewel_enchants) {
      for (let enchant of enchantments) {
        if (!entry.includes(enchant.phrase))
          continue;

        if (!collection.enchantments.hasOwnProperty(enchant.type))
          collection.enchantments[enchant.type] = { 'min': 0, 'max': 0, 'count': 0, 'total': 0 };

        let current_enchant = collection.enchantments[enchant.type];
        let effect = +entry.match(/Effect: (\d+)/i)[1];

        if (current_enchant.min == 0 || current_enchant.min > effect)
          current_enchant.min = effect;
        if (current_enchant.max == 0 || current_enchant.max < effect)
          current_enchant.max = effect;

        current_enchant.total += effect;
        current_enchant.count++;

        break;
      }
    }
  });

  // == Presentation
  /*
    ------------------------ Attributes ------------------------
    [Health:       +9,999   +38%] [Attack:        +9,999   +0%]
    [Defence:      -9,999    +0%] [Accuracy:      +9,999  +75%]
    [Evasion:      +9,999    +0%]
    -------------------------- Skills --------------------------
    [Critical-Hit Chance:  +652%] [Critical-Hit Damage:  +872%]
    [Jade-Drop:            +251%]
    ------------------------------------------------------------
  */
  let summary_style = document.createElement('style');
  summary_style.innerHTML = `
    .sum-ar {
      text-align:right;
      width: 55px;
    }
    .sum-al {
      text-align:left;
      width: 120px;
    }
    .sum-al, .sum-ar {
      display:inline-block;
    }`;
  document.head.appendChild(summary_style);

  let summary_wrapper = document.createElement('table');
  summary_wrapper.setAttribute('id', 'summary-wrapper');
  summary_wrapper.setAttribute('style', 'border-collapse:collapse; table-layout:fixed;');

  summary_wrapper.innerHTML = `
    <tr><td colspan="2"><hr></td></tr>
    <tr>
      <td><span style="float:left;"><span class="sum-al"><b>Health</b>:</span> <span class="sum-ar text-success">+999</span> <span class="sum-ar text-success">+999%</span></span></td>
      <td><span style="float:left;"><span class="sum-al"><b>Attack</b>:</span> <span class="sum-ar text-success">+99,999</span> <span class="sum-ar text-success">+999%</span></span></td>
    </tr>
    <tr>
      <td><span style="float:left;"><span class="sum-al"><b>Defence</b>:</span> <span class="sum-ar text-success">+99,999</span> <span class="sum-ar text-success">+999%</span></span></td>
      <td><span style="float:left;"><span class="sum-al"><b>Accuracy</b>:</span> <span class="sum-ar text-success">+9,999</span> <span class="sum-ar text-success">+999%</span></span></td>
    </tr>
    <tr>
      <td><span style="float:left;"><span class="sum-al"><b>Evasion</b>:</span> <span class="sum-ar text-success">+99,999</span> <span class="sum-ar text-success">+999%</span></span></td>
      <td><span style="float:left;"><span class="sum-al"><b>Armour Power</b>:</span> <span class="sum-ar text-success">+99,999</span> <span class="sum-ar text-success">+999%</span></span></td>
    </tr>
    <tr>
      <td><span style="float:left;"><span class="sum-al"><b>Weapon Power</b>:</span> <span class="sum-ar text-success">+99,999</span> <span class="sum-ar text-success">+999%</span></span></td>
    </tr>
    <tr><td colspan="2"><hr></td></tr>
    <tr>
      <td>
        <span style="float:left;"><span class="sum-al"><b>Critical-Hit Chance</b>:</span> <span class="sum-ar"></span> <span class="sum-ar text-success">+999%</span></span>
      </td>
      <td>
        <span style="float:left;"><span class="sum-al"><b>Critical-Hit Damage</b>:</span> <span class="sum-ar"></span> <span class="sum-ar text-success">+999%</span></span>
      </td>
    </tr>
    `;

  document.querySelector('.equippedItems').parentNode.appendChild(summary_wrapper);
}

function enchant_summary() {
  const filters = [
    { 'name': 'Accuracy', 'tag': 'accuracy boost' },
    { 'name': 'Armour Power', 'tag': 'armour power' },
    { 'name': 'Attack', 'tag': 'attack boost' },
    { 'name': 'Critical-Hit Chance', 'tag': 'critical hit chance' },
    { 'name': 'Critical-Hit Damage', 'tag': 'critical hit damage' },
    { 'name': 'Defence', 'tag': 'defence boost' },
    { 'name': 'Evasion', 'tag': 'evasion boost' },
    { 'name': 'Global Boost', 'tag': 'drop boost' },
    { 'name': 'Health', 'tag': 'health boost' },
    { 'name': 'Heroism', 'tag': 'heroism' },
    { 'name': 'Jack of all Jades', 'tag': 'jack of all jades' },
    { 'name': 'Jade Drop', 'tag': 'jade finds' },
    { 'name': 'Quest Boost', 'tag': 'quest boost' },
    { 'name': 'Stat Drop Boost', 'tag': 'stat drop boost' },
    { 'name': 'Taxonomy Boost', 'tag': 'taxonomy boost' },
    { 'name': 'Weapon Power', 'tag': 'weapon power ' }
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