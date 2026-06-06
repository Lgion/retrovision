(async () => {
    // Capture le flux vidéo de l'onglet courant
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
        // Crée un fichier vidéo WebM à la fin de l'enregistrement
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "enregistrement_page.webm";
        a.click();
    };

    // Démarre l'enregistrement
    mediaRecorder.start();
    console.log("Enregistrement démarré... Arrêtez le partage en bas de l'écran pour sauvegarder la vidéo.");
})();