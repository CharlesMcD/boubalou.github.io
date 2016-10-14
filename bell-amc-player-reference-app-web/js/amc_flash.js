/*
** JavaScript for flash AMC Web reference app
*/
var playing = false;
var notPopulated = true;

// static variables for AMC config parameters
var flashvars = '';
var swf_src = '';
var width = '';
var height = '';
var wmode = '';
var server_url = '';
var owner_uid = '';
var media_uid = '';
var user_token = '';
var mode = '';
var drm_seed = '';
var drm_enc_seed = '';
var start_bitrate = 0;
var max_bandwidth = 0;
var min_bandwidth = 0;
var cdn_profile = '';
var cdn_url = '';
var transcode_format = '';
var profile_type = '';
var app_token = '';
var primary = '';
var ad_req_param = '';
var ad_threshold = 0.5;
var sts_token = '';
var mds_token = '';
var logging_level = '';
var player = null;
var bookmark_property = false;
var sessionShift_property = false;
var analytics_property = false;
var sessionShared_property = false;
var ccEnabled = false;
var mdsToken = false;
var register = false;
var gotError = false;
var check = null;
var bg_opacity = 0.0;
var proginfo = false;
var useBellFonseControls_property = null;
var amcConfigFormName = null;
var mustRestart = false;
var alreadyInitialized = false;
var liveModeTimer;
var canShowChannelButtons = true;

const PLAYER_NOT_READY_TO_START_ERROR = 1001;

// toggle the AMC config and embed parameters fields
function toggleContent(id) {
    // get DOM reference
    var contentId = document.getElementById(id);

    // toggle
    contentId.style.display == "none" ? contentId.style.display = "block" : contentId.style.display = "none";
}

// create the embed player
function createPlayer(amcConfig) {
  amcConfigFormName = amcConfig;

  // show the player view and embed code view
  document.getElementById('playerCode').style.display = 'block';
  if (player != null) {
    playing = true;
    player.startNewPlayable({
      requestUrl: server_url,
      mediaUid: media_uid,
      playbackMode: mode,
      appToken: app_token,
      ownerUid: owner_uid,
      userToken: user_token,
      cdnProfile: cdn_profile,
      cdnUrl: cdn_url,
      startRate: start_bitrate,
      maxBandwidth: max_bandwidth,
      bookmarkPosition: 0,
      canShowChannelButtons: canShowChannelButtons
    });
  } else if (!playing) {
		console.log("createPlayer config: " + amcConfig);

		// get AMC config parameters
		getConfigurationParameters(amcConfig);

		if (gotError == false) {
			playing = true;
			notPopulated = true;

			// get AMC properties
			getAMCProperties(amcConfig);

			// construct the flashvars
			createFlashvars(amcConfig);

			// embed the player
			embedPlayer();
			console.log("setting swf timeout");
			check = setTimeout(function(){ checkSwf() }, 3000);
		}
	} else {
		alert("Player is already playing", 1000);
	}
}

// stop the player
function stopPlayer() {
	playing = false;
  console.log("stopPlayer");
	//document.getElementById('playerPos').style.display = "none";
	var subt = document.getElementById("subtitle");
	if (subt != null) {
		subt.options.length = 0;
	}
	var homeStatust = document.getElementById("homeStatus");
	if (homeStatust != null) {
		homeStatust.options.length = 0;
	}
	var audt = document.getElementById("audio");
	if (audt != null) {
		audt.options.length = 0;
	}
	var fontsize = document.getElementById("fontsize");
	if (fontsize != null) {
		fontsize.options.length = 0;
	}

	if (player != null) {
		player.stop();
		player.reset();
	} else {
		alert("Player is not available", 1000);
	}
}

function initAMCConfig(field) {
    console.log("initAMCConfig ...");
    switch (field.id) {
        case "amc_requestUrl":
            if (field.value == '') {
                alert("Please give the request URL!");
                server_url = '';
				gotError = true;
                return;
            }
            server_url = field.value;
            break;

        case "amc_ownerUID":
            if (field.value == '') {
                alert("Please give the Owner UID!");
                owner_uid = '';
				gotError = true;
                return;
            }
            owner_uid = field.value;
            break;

        case "amc_userToken":
            if (field.value == '') {
                alert("Please give the User Token!");
                user_token = '';
				gotError = true;
                return;
            }
            user_token = field.value;
            break;

        case "amc_mediaUID":
            if (field.value == '') {
                alert("Please give the Media UID!");
                media_uid = '';
				gotError = true;
                return;
            }
            media_uid = field.value;
            break;

        case "amc_mode":
            mode = field.value;
            break;

        case "amc_cdnProfile":
            cdn_profile = field.value;
            break;

        case "amc_cdnUrl":
            cdn_url = field.value;
            break;

        case "amc_primary":
            primary = field.value;
            break;

        case "amc_tf":
            transcode_format = field.value;
            break;

        case "amc_drmSeed":
            drm_seed = field.value;
            break;
        case "amc_drmEncSeed":
            drm_enc_seed = field.value;
            break;

        case "amc_maxBitrate":
			max_bandwidth = field.value;
			if (field.value == '') {
				max_bandwidth = 0;
			}
            break;

        case "amc_minBitrate":
            min_bandwidth = field.value;
			if (field.value == '') {
				min_bandwidth = 0;
			}
            break;

		case "amc_startBitrate":
			start_bitrate = field.value;
			if (field.value == '') {
				start_bitrate = 0;
			}
            break;
        case "amc_stsToken":
            sts_token = field.value;
            break;

        case "amc_adParam":
            ad_req_param = field.value;
            break;

        case "amc_adThreshold":
            ad_threshold = field.value;
            break;

        case "amc_loggingLevel":
            logging_level = field.value;
            break;

        case "amc_source":
            swf_src = field.value;
            break;

        case "amc_width":
            width = field.value;
            break;

        case "amc_height":
            height = field.value;
            break;

        case "amc_wmode":
            wmode = field.value;
            break;

        case "amc_appToken":
            app_token = field.value;
            break;

       case "amc_bgopacity":
            bg_opacity = field.value;
            if (field.value == '') {
               bg_opacity = 1.3;
            }
            break;

        default:
            break;
    }
}

function getConfigurationParameters(amcConfig) {
    var formElement = document.getElementById(amcConfig);
    var oField;

	gotError = false;
    for (var i = 0; i < formElement.elements.length; i++) {
        oField = formElement.elements[i];
        initAMCConfig(oField);
    }
}

function getAMCProperties(amcConfig) {
	var formElement = document.getElementById(amcConfig);
	var checked;
	var value;
	for (var i = 0; i < 9; i++) {
		value = formElement.amcProperty[i].value;
		checked = formElement.amcProperty[i].checked;

		switch (value) {
			case "bookmark":
				if (checked) {
					bookmark_property = true;
					console.log("bookmark enabled");
				} else {
					bookmark_property = false;
					console.log("bookmark disabled");
				}
				break;

			case "sessionShift":
				if (checked) {
					sessionShift_property = true;
					console.log("session shift enabled");
				} else {
					sessionShift_property = false;
					console.log("session shift disabled");
				}
				break;

			case "analytics":
				if (value == "analytics" && checked) {
					console.log("analytics enabled");
					analytics_property = true;
				} else {
					console.log("analytics disabled");
					analytics_property = false;
				}
				break;

			case "sessionShiftShared":
				if (checked) {
					console.log("session shared enabled");
					sessionShared_property = true;
				} else {
					console.log("session shared disabled");
					sessionShared_property = false;
				}
				break;

      case "useBellFonseControls":
        if (checked) {
          console.log("use Bell/Fonse controls enabled");
          useBellFonseControls_property = true;
        } else {
          console.log("use Bell/Fonse controls disabled");
          useBellFonseControls_property = false;
        }
        break;

			case "ccEnable":
				if (checked) {
					console.log("CC enabled");
					ccEnabled = true;
				} else {
					console.log("CC disenabled");
					ccEnabled = false;
				}
        if (player) {
            player.setCC(ccEnabled);
        }
				break;

			case "mdsToken":
				if (checked) {
					console.log("Get mds token");
					mdsToken = true;
				} else {
					mdsToken = false;
				}

			case "register":
				if (checked) {
					console.log("register");
					register = true;
				} else {
					register = false;
				}
				break;

				case "proginfo":
				if (checked) {
					console.log("Get Program Info");
					proginfo = true;
					if (player) {
						player.getProgramInfo(proginfo);
					}
				} else {
					console.log("Program Info unchecked");
					proginfo = false;
				}
				break;
			default:
				console.log("Unsupported property!");
				break;
		}
	}
}

function createFlashvars() {
	flashvars = "requestUrl=" + server_url + "&ownerUid=" + owner_uid + "&userToken=" + user_token + "&mediaUid=" + media_uid + "&mode=" + mode;
  flashvars = flashvars + "&seed=" + drm_seed;
  flashvars = flashvars + "&encSeed=" + drm_enc_seed;
  flashvars = flashvars + "&maxBandwidth=" + max_bandwidth;
  flashvars = flashvars + "&minBandwidth=" + min_bandwidth;
  flashvars = flashvars + "&cdnProfile=" + cdn_profile;
  flashvars = flashvars + "&cdnUrl=" + cdn_url;
  flashvars = flashvars + "&profType=" + profile_type;
  flashvars = flashvars + "&transcodeFormat=" + transcode_format;
  flashvars = flashvars + "&primary=" + primary;
  flashvars = flashvars + "&logLevel=" + logging_level;
  flashvars = flashvars + "&startRate=" + start_bitrate;
  flashvars = flashvars + "&mdsToken=" + mdsToken;
  flashvars = flashvars + "&register=" + register;
  flashvars = flashvars + "&appToken=" + app_token;
  flashvars = flashvars + "&bgopacity=" + bg_opacity;
  flashvars = flashvars + "&adThreshold=" + ad_threshold;
  flashvars = flashvars + "&useBellFonseControls=" + useBellFonseControls_property;
  flashvars = flashvars + "&channelUpDownText=" + document.getElementById("channelUpDownText").value;
  flashvars = flashvars + "&channelLastText=" + document.getElementById("channelLastText").value;
	flashvars = flashvars + "&javascriptCallbackFunction=onJSCallback";
}

function embedPlayer() {
    var embedCode = '<object id="amc_flash_id" width="' + width  + '" height="' + height + '" data="' + swf_src +'"> ';
	embedCode += '<param name="movie" value="'+ swf_src + '"></param>';
	embedCode += '<param name="flashvars" value="'+ flashvars + '"></param>';
	embedCode += '<param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param>';
	embedCode += '<param name="wmode" value="'+ wmode +'"></param>'
	embedCode += '</object>';

    var player_div = document.getElementById('player');
    player_div.innerHTML = embedCode;

    var embed_code_div = document.getElementById('embedcode');
    embed_code_div.textContent = embedCode;
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ':' + minutes + ':' + seconds;
    return time;
}

function checkSwf() {
	console.log("checkSwf");
	clearTimeout(check);
	console.log("in timeout " + player);
	if (player == null) {
		alert("Please check the swf path");
		playing = false;
		document.getElementById('playerPos').style.display = "none";
	}
}
function liveModeTick() {
	if (playing) {
		var pos = "" + (player.getVideoPosition() / 1000);
		var dur = "" + (player.getVideoDuration() / 1000);
		document.getElementById('playerPos').innerHTML = "Duration : " + pos.toHHMMSS() + "/" + dur.toHHMMSS() + " (seconds)";
	}
}

function changeDefaultPlaybackMediaUID(playbackMode) {
  let amc_mediaUID = document.getElementById('amc_mediaUID');

  if (playbackMode === "live") {
    amc_mediaUID.value = "CBCVH";
    mode = "live";
  } else if (playbackMode === "vod") {
    amc_mediaUID.value = "FXC7V01";
    mode = "adaptive";
  } else {
    amc_mediaUID.value = "CP24H_2016-09-26T140000Z_abr";
    mode = "adaptive";
  }
  media_uid = amc_mediaUID.value;
}

function changedSubtitle(name) {
	console.log("changedSubtitle " + name);
	player.setSubtitle(name);
}

function changedHomeStatus(name) {
	console.log("changedHomeStatus " + name);
	player.setHomeStatus(name);
}


function changedAudio(name) {
	console.log("changedAudio " + name);
	player.setAudio(name);
}

function changedCC(value) {
	var x = document.getElementById("cc").checked;
	console.log("changedCC " + x);
	player.setCC(x);
}

function changedProgInfo(value) {
	var x = document.getElementById("prginfo").checked;
	console.log("changedProgInfo " + x);
	if (x) {
		player.getProgramInfo();
	}
}

function changedFontSize(size) {
	console.log("changedFontSize " + size);
	player.setFontSize(size);
}

function changedFontColor(color) {
	console.log("changedFontColor " + color);
	player.setFontColor(color);
}

function changedBackgroundFontColor(color) {
	console.log("changedBackgroundFontColor " + color);
	player.setBackgroundFontColor(color);
}

function changedSubtitleBackgroundOpacity(value) {
	console.log("changedSubtitleBackgroundOpacity " + value);
	player.setSubtitleBackgroundOpacity(value);
}

function changedSubtitleFontName(name) {
        console.log("changedSubtitleFontName " + name);
        player.setSubtitleFontName(name);
}

function changedLoggingLevel(value) {
	console.log("changedLoggingLevel: " + value);
	player.setLogLevel(value);
}

function createHeaderDiv() {
    header_div = document.getElementById('header');
    var headerStr = "<h3>AMC Configuration (" + player.getAmcVersion() + ")</h3>";
    header_div.innerHTML = headerStr;
}

function updateBitrate(rate) {
	bitrate_div = document.getElementById('bitrate');
    bitrate_div.innerHTML = "Current Bitrate : " + rate + "(kbps)";
}

function onJSCallback(playerId, event, obj) {
  console.log("onJSCallback playerId: " + playerId + " event: " + event + " obj: " + obj);

  player = document.getElementById('amc_flash_id');
	clearTimeout(check);

  switch (event) {
    case "onJavaScriptBridgeCreated":
      break;
		case "onInitCompleted":
      player.setCC(ccEnabled);
      player.setPlaybackUIControlsConfiguration(buildPlaybackUIControlsConfiguration());
      player.setVideoTitle(document.getElementById('playbackStaticInfoTitle').value);
      player.setChannelLogoURL(document.getElementById('playbackStaticInfoChannelLogoURL').value);
      player.setChannelLogoPlaceholder(document.getElementById('playbackStaticInfoChannelLogoPlaceholder').value);
      player.setChannelLabel(document.getElementById('playbackStaticInfoChannelLabel').value);
      player.setProgressViewData(buildProgressViewData());
      player.setCanShowChannelButtons(canShowChannelButtons);

      if (mode == "live") {
        //document.getElementById('playerPos').style.display = "block";
        liveModeTimer = window.setInterval(liveModeTick, 1000);
      } else {
        window.clearInterval(liveModeTimer);
        //document.getElementById('playerPos').style.display = "none";
      }

      // We've introduced the possibility to change the video mode and media id without re-creating the whole flash player to retain the native Flash UI but
      // it was impossible to not get callbacked with onInitCompleted by the AmcManager. Let's keep a flag for these cases.
      if (alreadyInitialized) return;

			// update the header field of the html page to include the AMC version
			createHeaderDiv();

			// initialize the bitrate field
			updateBitrate(0);

      // start the AMC
			player.prepare();
      player.start();

      alreadyInitialized = true;
      break;

		case "onOutOfHomeBlockedChanged":
			var state = obj.state;
			console.log("onOutOfHomeBlockedChanged = " + state);
			if (state == true) {
			console.log("insidesss = " + state);
				var homeStatusT = document.getElementById("homeStatus");
				homeStatusT.options.length = 3;
				homeStatusT.options[0] = new Option("0", "0", true, false);
				homeStatusT.options[1] = new Option("1", "1", true, false);
				homeStatusT.options[2] = new Option("2", "2", true, false);
			}
		  break;

    case "onStateChanged":
     	var state = obj.state;
			console.log("state = " + state);
			// initialize the bitrate field
			updateBitrate(player.getBitrate());

      if (notPopulated) {
				var subt = document.getElementById("subtitle");
				var audt = document.getElementById("audio");
				subt.options.length = 0;
				audt.options.length = 0;

				var subs = player.getSubtitles();
				console.log("onJSCallback subs = " + subs);
				if (subs != null) {
					var subName = player.getCurrentSubtitle();
					console.log("onJSCallback currentsubtitle = " + subName);
					var i = 0;
					if (subs.length > 0) {
						// have subtitles
						subt.options[subt.options.length] = new Option("None", "None", true, false);
					}
					for (i = 0; i<subs.length; i++) {
						subt.options[subt.options.length] = new Option(subs[i], subs[i], true, false);
						if (subName && subs[i] == subName) {
						   savedI = i+1;
						}
					}
					console.log("onJSCallback currentsubtitle index = " + savedI);
					subt.selectedIndex = savedI;
				}

				var auds = player.getAudioTracks();
				if (auds != null) {
					var audName = player.getCurrentAudio();
					console.log("onJSCallback currentaudio = " + audName);
					var i = 0;
					console.log("onJSCallback auds = " + auds);
					for (i = 0; i<auds.length; i++) {
						audt.options[audt.options.length] = new Option(auds[i], auds[i], true, false);
						if (audName && auds[i] == audName) {
						  savedI = i;
						}

					}
					console.log("onJSCallback currentaudio index = " + savedI);
					audt.selectedIndex = savedI;
				}

				var fontsize = document.getElementById("fontsize");
				fontsize.options.length = 0;
				for (i = 10; i< 30; i++) {
					fontsize.options[fontsize.options.length] = new Option(i, i, true, false);
				}

				notPopulated = false;
			}
			if (state == 16) {
				playing = false;
				console.log("Done");
				var subt = document.getElementById("subtitle");
				if (subt != null) {
					subt.options.length = 0;
				}
				var audt = document.getElementById("audio");
				if (audt != null) {
					audt.options.length = 0;
				}
				//player = null;

        if (mustRestart) {
          mustRestart = false;

          player.start();
        }
			}
      break;

    case "onBitrateChanged":
    	updateBitrate(obj.rate);
      console.log("onBitrateChanged: " + obj.rate);
      break;

		case "onError":
			playing = false;
			console.log("onError code: " + obj.code);
			var subt = document.getElementById("subtitle");
			if (subt != null) {
				subt.options.length = 0;
			}
			var audt = document.getElementById("audio");
			if (audt != null) {
				audt.options.length = 0;
			}
      break;

		case "onMdsToken" :
  		console.log("onMdsToken");
	   	break;

		case "onMdsTokenError" :
		  console.log("onMdsTokenError");
		  break;

    case "onUiElementExecuted":
      handleUiElementsExecution(obj.uiElementId);
      break;

    case "onUserInteraction":
      break;

    default:
      break;
  }
}

function handleUiElementsExecution(uiElementId) {
  switch (uiElementId) {
    case "BACK_BUTTON":
      stopPlayer();
      break;

    case "PAUSE_BUTTON":
      player.pause();
      break;

    case "PLAY_BUTTON":
      player.play();
      break;

    case "RESTART_BUTTON":
      player.stop();
      player.reset();

      mustRestart = true;
      break;

    case "INTERACTIVE_NOTIFICATION_CLOSE_BUTTON":
    case "INTERACTIVE_NOTIFICATION_CONTINUE_BUTTON":
      document.getElementById('interactiveNotificationsViewDataActive').checked = false;
      player.setInteractiveNotificationViewData(buildInteractiveNotificationViewData());
      break;

    case "CHANNEL_DOWN_BUTTON":
    case "CHANNEL_UP_BUTTON":
    case "CHANNEL_LAST_BUTTON":
      if (media_uid === "CBCVH") {
        media_uid = "CTYHT"
      } else {
        media_uid = "CBCVH"
      }
      createPlayer(amcConfigFormName);
      break;

    case "ON_NOW_BUTTON":
      canShowChannelButtons = !canShowChannelButtons;
      player.setCanShowChannelButtons(canShowChannelButtons);
      break;

    default:
      console.error("handleUiElementsExecution unhandled element: " + uiElementId);
      break;
  }
}

function buildPlaybackUIControlsConfiguration() {
  let config = {};

  var formElement = document.getElementById(amcConfigFormName);
  var checked;
  var value;
  for (var i = 0; i < 3; i++) {
    value = formElement.playbackUIControlsConfiguration[i].value;
    checked = formElement.playbackUIControlsConfiguration[i].checked;

    config[value] = checked;
    console.log("playbackUIControlsConfiguration " + value + (checked ? " enabled" : " disabled"));
  }
  console.log(config);
  return config;
}

function buildProgressViewData() {
  let progressViewData = {};

  progressViewData["percentage"] = parseInt(document.getElementById('playbackProgressDataPercentage').value);
  progressViewData["startText"] = document.getElementById('playbackProgressDataStartText').value;
  progressViewData["endText"] = document.getElementById('playbackProgressDataEndText').value;
  progressViewData["progressText"] = document.getElementById('playbackProgressDataProgressText').value;

  return progressViewData;
}

function buildInteractiveNotificationViewData() {
  let interactiveNotificationViewData = {};

  interactiveNotificationViewData["timeRemainingInSeconds"] = parseInt(document.getElementById('interactiveNotificationsViewDataTimeRemaining').value);
  interactiveNotificationViewData["title"] = document.getElementById('interactiveNotificationsViewDataTitle').value;
  interactiveNotificationViewData["subtitle"] = document.getElementById('interactiveNotificationsViewDataSubtitle').value;
  interactiveNotificationViewData["active"] = document.getElementById('interactiveNotificationsViewDataActive').checked;
  interactiveNotificationViewData["type"] = document.getElementById('interactiveNotificationsViewDataType').value;

  return interactiveNotificationViewData;
}

function playbackProgressDataChange() {
  if (player != null) {
    player.setProgressViewData(buildProgressViewData());
  }
}

function playbackUIControlsConfigurationChange() {
  if (player != null) {
    player.setPlaybackUIControlsConfiguration(buildPlaybackUIControlsConfiguration());
  }
}

function interactiveNotificationsViewDataChange() {
  if (player != null) {
    player.setInteractiveNotificationViewData(buildInteractiveNotificationViewData());
  }
}

function onCurrentTimeChange(time, playerId) {
    console.log("onCurrentTimeChange is call, time = " + time);
}

function onDurationChange(time, playerId) {
    console.log("onDurationChange, time = " + time);
}

function onMediaPlayerStateChange (value, playerId) {
    console.log("onMediaPlayerStateChange, value = " + value);
}
