$(document).ready(function() {
  $('#techshop').toggle();
  $('.startnew').on('click', startSetup);
  $('#playersCards').on('click', '.playercard', selectCardtoPlay);
  $('.playselected').on('click', function(){
    togglePlayButton();
    playSelectedCards();
    parsePlayedEffects();
    resolveAllEffects();
    });
  $('.selectall').on('click',
    selectAll);
  $('.shopbutton').on('click', function(){
    $('.gamelog').toggle();
    $('#techshop').toggle();
    $('.shopbutton').css('visibility', 'hidden')
    $('.refillhand').css('visibility', 'hidden')
    $('#inventory input').val(0);
  });
  $('.buyall').on('click', function(){
    $('.gamelog').toggle();
    $('#techshop').toggle();
    getTech();
    $('.shopbutton').css('visibility', 'visible')
    $('.refillhand').css('visibility', 'visible')
  });
  $('.cancelshop').on('click', function(){
    $('.gamelog').toggle();
    $('#techshop').toggle();
    $('.shopbutton').css('visibility', 'visible')
    $('.refillhand').css('visibility', 'visible')
  });

  $('.refillhand').on('click', function(){
    togglePlayButton();
    fillHand();
    });
  $('.runaway').on('click',function(){
    if(player.hp > 2){
      printMsg('You have escaped with minor damage!');
      loseHp(2);
      drawEnemy();
    }
    else{
      printMsg('Too damaged to escape!');
    }
  });

//UI toggle
  function togglePlayButton(){
    if($('.playselected').css('visibility') === 'visible'){
      $('.playselected').css('visibility', 'hidden')
      $('.selectall').css('visibility', 'hidden')
      $('.shopbutton').css('visibility', 'visible')
      $('.refillhand').css('visibility', 'visible')
    }
    else{
      $('.playselected').css('visibility', 'visible')
      $('.selectall').css('visibility', 'visible')
      $('.shopbutton').css('visibility', 'hidden')
      $('.refillhand').css('visibility', 'hidden')
    }
  }

//variables for game use
  var enemycards1list = $.parseJSON($('#ec1').attr('datastuff'))
  var enemycards2list = $.parseJSON($('#ec2').attr('datastuff'))
  var enemycards3list = $.parseJSON($('#ec3').attr('datastuff'))

  var attackcardslist = $.parseJSON($('#ac').attr('datastuff'))
  var tacticscardslist = $.parseJSON($('#tc').attr('datastuff'))

  var player = {
    hp:10,
    tp:0,
    vp:0
  };
  var initTacticsCards = 3;
  var initAttackCards = 7;
  var playerDeck = [];
  var playerHand = [];
  var playerDiscard = [];
  var enemyDeck1 = [];
  var enemyDeck2 = [];
  var enemyDeck3 = [];
  var currentEnemy = "";
  var turnCounter = 0;
  var maxMessages = 50;
  var maxHandsize = 5;
  var playingCards = [];
  var resolveEffects = {
    dam: 0,
    shield: 0,
    hpgain: 0,
    tpgain: 0
  }
  var shoppingcart = {};
  var shoppingbill = 0;
//end of variables

//setup functions
  function startSetup(){
    if(turnCounter === 0){
      $('.objectives').remove();
      $('.gamenotices').css('display', 'none');
      $('#playerhand').css('visibility', 'visible');
      $('.top').css('visibility', 'visible');
      turnOnButtons();
      enemySetup();
      playerSetup();
      turnCounter += 1;
    }
    showPlayerStats();
    showDeckStats();
    $('.startnew').remove();
  }

  function turnOnButtons(){
    $('.playselected').css('visibility', 'visible');
    $('.selectall').css('visibility', 'visible');
  }

//enemy setup
  function enemySetup(){
    // deck 1
    gatherEnemyCards1(10,0);
    gatherEnemyCards1(7,1);
    gatherEnemyCards1(5,2);
    gatherEnemyCards1(2,3);
    // deck 2
    gatherEnemyCards2(10,0);
    gatherEnemyCards2(7,1);
    gatherEnemyCards2(5,2);
    gatherEnemyCards2(2,3);
    //deck 3
    gatherEnemyCards3(10,0);
    gatherEnemyCards3(8,1);
    gatherEnemyCards3(6,2);
    gatherEnemyCards3(1,3);
    gatherEnemyCards3(1,4);
    gatherEnemyCards3(1,5);

    shuffle(enemyDeck1);
    shuffle(enemyDeck2);
    shuffle(enemyDeck3);
    //starting enemy
    drawEnemy();
  }
  function gatherEnemyCards1(num,cardid){
    for (var i = 0; i < num; i++) {
      enemyDeck1.push(enemycards1list[cardid]);
    }
  }
  function gatherEnemyCards2(num,cardid){
    for (var i = 0; i < num; i++) {
      enemyDeck2.push(enemycards2list[cardid]);
    }
  }
  function gatherEnemyCards3(num,cardid){
    for (var i = 0; i < num; i++) {
      enemyDeck3.push(enemycards3list[cardid]);
    }
  }

  function clearEnemyLevel(){
    if(player.vp >= 5 && enemyDeck1.length > 0){
      enemyDeck1 = [];
      printMsg('Level 1 enemies cleared...');
    }
    else if(player.vp >= 10 && enemyDeck2.length > 0){
      enemyDeck2 = [];
      printMsg('Level 2 enemies cleared...');
    }
  }

  function clearEnemy(){
    currentEnemy = "";
    $('#enemypicture p:nth-child(2)').remove();
  }

  function drawEnemy(){
    clearEnemy();
    if(enemyDeck1.length > 0){
      currentEnemy = enemyDeck1.shift();
    }
    else if(enemyDeck2.length > 0){
      currentEnemy = enemyDeck2.shift();
    }
    else {
      currentEnemy = enemyDeck3.shift();
    }
    printMsg('Entering battle with '+currentEnemy.name+" (with "+currentEnemy.hp+" hp)");
    showEnemy(currentEnemy);
  }

  function showEnemy(card){
    $('.enemypic img').attr('src', '/assets/'+card.img)
    $('.enemycard td.name').html(card.name);
    $('.enemycard td.hp').html(card.hp);
    $('.enemycard td.dam').html(card.damage);
    $('.enemycard td.tp').html(card.tp);
    $('.enemycard td.vp').html(card.vp);
    $('.enemycard td.text').html(card.description);
    $('.enemylevel').html(card.lvl);
  }

  function enemyLoseHp(num){
    //find current hp
    var temphp = $('.enemycard td.hp').html();
    //decrement damage and update hp
    temphp -= num;
    $('.enemycard td.hp').html(temphp);
    //check if dead
    if(temphp < 1){
      player.tp += currentEnemy.tp;
      player.vp += currentEnemy.vp;
      printMsg(currentEnemy.name + " defeated! Gained "+currentEnemy.tp+" TP and "+currentEnemy.vp+" VP!");
      clearEnemyLevel();
      clearEnemy();
      drawEnemy();
    }
    else {
      enemyAttack();
    }
  }

// player setup
  function playerSetup(){
    var start = [];
    for(i = 0; i < initTacticsCards; i++) {
      start.push(tacticscardslist[0]);
    }
    for(i = 0; i < initAttackCards; i++) {
      start.push(attackcardslist[0]);
    }
    shuffle(start);

    for (i = 0; i < 5; i++) {
      playerHand.push(start.shift());
    }
    playerDeck = start;
    showPlayer();
  }

  function showPlayerStats(){
    $('#infobar .playerhp').html(player.hp);
    $('#infobar .playertp').html(player.tp);
    $('#infobar .playervp').html(player.vp);
    $('#infobar .playerturn').html(turnCounter);
  }

  function showDeckStats(){
    $('#deckanddiscard .deckcount').html(playerDeck.length);
    $('#deckanddiscard .discardcount').html(playerDiscard.length);
  }

  function clearPlayer(){
    $('#playersCards').html("");
  }

  function showPlayer(){
    clearPlayer();
    for (i = 0; i < playerHand.length; i++) {
      if (playerHand[i].hasOwnProperty('damage')){
        showAttackCard(playerHand[i]);
      }
      else {
        showTacticsCard(playerHand[i]);
      }
    }
  }

  function showAttackCard(card){
    $('#playersCards').append("<div class='playercard noplay'><img src='/assets/"+card.img+"'/><span class='attacktitle'>"+card.name+"</span><br>damage: "+card.damage+"<br><span class='flavortext'>"+card.description+"</span></div>");
  }

  function showTacticsCard(card){
    $('#playersCards').append("<div class='playercard noplay'><img src='/assets/"+card.img+"'/><span class='tacticstitle'>"+card.name+"</span><br>effect: "+card.description+"</div>");
  }
// shuffle
 function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
      }
      return array;
  }
// game functions
  function selectCardtoPlay(){
    if($(this).attr('class') === 'playercard noplay'){
    $(this).attr('class', 'playercard play')
    }
    else {
      $(this).attr('class', 'playercard noplay')
    }
  }

  function selectAll(){
    $('.noplay').attr('class', 'playercard play');
  }

  function playSelectedCards(){
    var playTheseCards = [];
    for(var idx = 1;idx<=5;idx++){
      if($( "div#playersCards div:nth-child("+idx+")" ).attr('class') === 'playercard play'){
        //save indexes of cards to play
        printMsg("You have played "+playerHand[idx - 1].name);
        playTheseCards.push(idx - 1);
      }
    }
    //wipe html of all played cards
    $('#playersCards div.play').remove()
    for(var i = 0; i < playTheseCards.length; i++){
      //move copy to discard and playing cards array
      playerDiscard.push(playerHand[playTheseCards[i]]);
      playingCards.push(playerHand[playTheseCards[i]]);
      //mark cards in hand to delete
      playerHand[playTheseCards[i]] = 'del'
    }
    //delete them
    for(i = 0; i < playTheseCards.length; i++){
      var temp = playerHand.indexOf('del');
      playerHand.splice(temp, 1);
    }
    showDeckStats();
  }

  function parsePlayedEffects(){
    var playedAtks = 0;
    for(var i = 0; i < playingCards.length; i++){
      if(playingCards[i].hasOwnProperty('damage')){
        playedAtks += 1;
        resolveEffects.dam += playingCards[i].damage;
      }
      else if(playingCards[i].name === 'Evade'){
        resolveEffects.shield += 1;
      }
      else if(playingCards[i].name === 'Smoke Dispensers'){
        resolveEffects.shield += 2;
      }
      else if(playingCards[i].name === 'Antibeam depth charge'){
        resolveEffects.dam -= 3;
        resolveEffects.shield += 3;
      }
      else if(playingCards[i].name === 'Emergency repairs'){
        resolveEffects.hpgain += 1;
      }
      else if(playingCards[i].name === 'Scavenge supplies'){
        resolveEffects.tpgain += 1;
      }
      else if(playingCards[i].name === 'Targeting computers'){
        resolveEffects.dam += playedAtks;
      }
    }
  }

  function resolveAllEffects(){
    if(resolveEffects.tpgain > 0){
      gainTp(resolveEffects.tpgain);
    }
    if(resolveEffects.hpgain > 0){
      gainHp(resolveEffects.hpgain);
    }
    if(resolveEffects.dam > 0){
      printMsg('You have dealt '+resolveEffects.dam+' damage!');
      enemyLoseHp(resolveEffects.dam);
    }
    else {
      enemyAttack();
    }
    zeroEffects();
    showPlayerStats();
  }

  function enemyAttack(){
    var tempDamage = currentEnemy.damage - resolveEffects.shield;
    if(tempDamage < 0){
      tempDamage = 0;
    }
    printMsg('Dodge '+resolveEffects.shield+' damage. '+currentEnemy.name+' hits you for '+tempDamage+' damage!');
    player.hp -= tempDamage;
    if(player.hp < 1){
      youLose();
    }
  }

  function zeroEffects(){
    playingCards = [];
    resolveEffects.dam = 0;
    resolveEffects.shield = 0;
    resolveEffects.hpgain = 0;
    resolveEffects.tpgain = 0;
  }

  function printMsg(string) {
    if($('.gamelog li').length === maxMessages){
      $('.gamelog li:nth-child(1)').remove();
    }
    $('.gamelog ul').append('<li>'+string+'</li>');
    $('.gamelog').scrollTop($('.gamelog')[0].scrollHeight);
  }

  function fillHand(){
    while(playerHand.length < maxHandsize){
      if(playerDeck.length < 1){
        reshuffleDiscard();
      }
      playerHand.push(playerDeck.shift());
    }
    turnCounter++;
    showPlayerStats();
    showPlayer();
    showDeckStats();
  }

  function reshuffleDiscard(){
    playerDeck = playerDeck.concat(playerDiscard);
    playerDiscard = [];
    showDeckStats();
  }

  function drawCards(num){
    for(i = 0; i < num; i++){
      if(playerHand.length < maxHandsize){
      playerHand.push(playerDeck.shift());
      }
    }
    showPlayer();
    showDeckStats();
  }

  function loseHp(lose){
    player.hp -= lose;
    printMsg('You have taken '+lose+' damage!');
    showPlayerStats();
  }

  function gainHp(gain){
    player.hp += gain;
    if(player.hp > 10){
      player.hp = 10;
    }
    printMsg('You have regained '+gain+' hit points.');
    showPlayerStats();
  }

  function loseTp(spend){
    player.tp -= spend;
    printMsg("You've spent "+spend+" tech points.");
    showPlayerStats();
  }

  function gainTp(gain){
    player.tp += gain;
    printMsg("You've gained "+gain+" tech points.");
    showPlayerStats();
  }

  function gainVp(gain){
    player.vp += gain;
    printMsg("Earned "+gain+" victory points!");
    showPlayerStats();
    if(player.vp > 14){
      youWin();
    }
  }

  function getTech(){
    //get attack cards
    for(var idx = 1;idx <= attackcardslist.length;idx++){
      shoppingcart["atk"+idx] = $('.atk'+idx).val();
    }
    //get tactics cards
    for(var idx = 1;idx <= tacticscardslist.length;idx++){
      shoppingcart["tac"+idx] = $('.tac'+idx).val();
    }
    if(costOk()){
      receiveTech();
      payForGoods();
    }
    else{
      shoppingbill = 0;
      alert("SHOPPING FAILED, you're too poor to afford all that!");
    }
  }

  function receiveTech(){
    for(var key in shoppingcart){
      // buy attack cards
      if(key.substring(0,3) === "atk" && shoppingcart[key] > 0){
        var i = key.substring(3,4) - 1;
        for(var num = 0; num < shoppingcart[key]; num++)
        {
          playerDeck.unshift(attackcardslist[i]);
        }
      }
      // buy tactics
      else{
        var i = key.substring(3,4) - 1;
        for(var num = 0; num < shoppingcart[key]; num++)
        {
          playerDeck.unshift(tacticscardslist[i]);
        }
      }
    }
  }

  function costOk(){
    for(var key in shoppingcart){
      if(key.substring(0,3) === "atk"){
        var i = key.substring(3,4) - 1;
        for(var num = 0; num < shoppingcart[key]; num++)
        {
          shoppingbill += attackcardslist[i].cost
        }
      }
      else {
        var i = key.substring(3,4) - 1;
        for(var num = 0; num < shoppingcart[key]; num++)
        {
          shoppingbill += tacticscardslist[i].cost
        }
      }
    }
    if(shoppingbill <= player.tp){
      return true;
    }
    else {
      return false;
    }
  }

  function payForGoods(){
    player.tp -= shoppingbill;
    printMsg('You have spent '+shoppingbill+' TP.');
    shoppingbill = 0;
    showDeckStats();
    showPlayerStats();
  }

  function youLose(){
    $('.top').remove();
    $('#playerhand').remove();
    $('.gamenotices').css('display', 'block');
    $('.gamenotices').html('YOU HAVE BEEN DESTROYED!');
  };

  function youWin(){
    $('.top').remove();
    $('#playerhand').remove();
    $('.gamenotices').css('display', 'block');
    $('.gamenotices').html('YOU HAVE DEFEATED ALL OF YOUR ENEMIES,VICTORY!');
  }
});
