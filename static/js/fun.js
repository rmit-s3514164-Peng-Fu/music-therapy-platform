/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2016-09-13 15:07:47
 * @version $Id$
 */

$(document).ready(function() {
  // initialization
  SC.initialize({
    client_id: "35233ac5f182ed5dc5d4c7ca506dd1f5"
  });

  // visualize the embedded player
  	SC.oEmbed('https://soundcloud.com/final-fantasy-soundtracks/final-fantasy-x-ost-to', 
  		{maxheight: 100, element: document.getElementById('player')},
  		function(res) {
      $('player').value = res.html;
    });

    // visualize the embedded playlist
  	SC.oEmbed('https://soundcloud.com/nils_frahm/sets/piano-day-playlist-march-29th', 
  		{element: document.getElementById('playlist')},
  		function(res) {
      $('playlist').value = res.html;
    });  
});