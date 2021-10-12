const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playIcon = document.getElementById("playIcon")
const muteBtn = document.getElementById("mute");
const muteIcon = document.getElementById("muteIcon")
const volumeRange = document.getElementById("volume");

const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");

const timeline = document.getElementById("timeLine");

const fullScreenBtn = document.getElementById("fullScreen");
const screenIcon = document.getElementById("screenIcon")
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMoveTime = null;
let userVolume = 0.5;
video.volume = userVolume;

const handlePlay = (e) => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playIcon.className = video.paused ? "fas fa-play" : "fas fa-pause";
};
const handleMute = (e) => {
    video.muted = !video.muted;
    muteIcon.className = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : userVolume;
};
const handleVolumeChange = (event) => {
    const {
        target: { value }
    } = event;
    if (video.muted) {
        video.muted = false;
        muteBtn.innerText = "Mute";
    }
    userVolume = value;
    video.volume = value;
};

const formatTime = (sec) => new Date(sec * 1000).toISOString().substr(11, 8);

const handleLoadedMetaData = (event) => {
    const baseTime = Math.floor(video.duration);
    const formattedTime = formatTime(baseTime);
    totalTime.innerText = formattedTime;
    timeline.max = baseTime;
};

const handleTimeUpdate = (event) => {
    const baseTime = Math.floor(video.currentTime);
    const formattedTime = formatTime(baseTime);
    currentTime.innerText = formattedTime;
    timeline.value = baseTime;
};

const handleTimeline = (event) => {
    const {
        target: { value: timeValue }
    } = event;
    video.currentTime = timeValue;
};

const handleFullScreen = (event) => {
    const fullScreen = document.fullscreenElement;
    if (fullScreen) {
        document.exitFullscreen();
        screenIcon.className = "fas fa-expand-alt"
    } else {
        videoContainer.requestFullscreen();
        screenIcon.className = "fas fa-compress-alt"
    }
};

const hideControls = () => {
    videoControls.classList.remove("showing")
    videoControls.style.opacity = 0
}

const handleVideoMouseMove = () => {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if (controlsMoveTime) {
        controlsMoveTime = null;
    }
    videoControls.classList.add("showing")
    videoControls.style.opacity = 1
    controlsMoveTime = setTimeout(hideControls, 1500)
};

const handleVideoMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 1500);
};

const handleESC = (event) => {
    // console.log(event.keyCode);
    if (event.keyCode === 102) {
        videoContainer.requestFullscreen();
    }
};
const handlePauseStop = (event) => {
    if (event.keyCode === 32) {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }
    playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleEnded = () => {
    const {id} = videoContainer.dataset
    fetch(`/api/videos/${id}/views`, {
        method : "POST"
    })
}

const handleVideoClick = (event) => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playIcon.className = video.paused ? "fas fa-play" : "fas fa-pause";
}

playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimeline);
fullScreenBtn.addEventListener("click", handleFullScreen);
video.addEventListener("mousemove", handleVideoMouseMove);
video.addEventListener("click", handleVideoClick);

// media 전용 이벤트
videoContainer.addEventListener("mouseleave", handleVideoMouseLeave);
video.addEventListener("ended", handleEnded)

window.addEventListener("keypress", handleESC);
window.addEventListener("keypress", handlePauseStop);
