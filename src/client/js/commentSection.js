const videoContainer = document.getElementById("videoContainer")
const form = document.getElementById("commentForm")

const handleSubmit = (event) => {
    event.preventDefault()
    const textarea = form.querySelector("textarea")
    const video_id = videoContainer.dataset.id
    const text = textarea.value
    if (text === ""){
        return
    }
    fetch(`/api/videos/${video_id}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({text: text})
    })
    textarea.value = ""
}
if(form){
    addEventListener("submit", handleSubmit)
}