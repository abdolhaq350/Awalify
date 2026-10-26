import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCo6rXeNp175RZ857xFznE_JaCvosq0xDA",
  authDomain: "awalify-37fad.firebaseapp.com",
  projectId: "awalify-37fad",
  storageBucket: "awalify-37fad.firebasestorage.app",
  messagingSenderId: "1016326916194",
  appId: "1:1016326916194:web:9cc2cd56de38c8728e293b"
};

async function initAwalifyPlatform() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const docRef = doc(db, "app_config", "latest");

        // جلب البيانات الأساسية للموقع
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            const downloadBtn = document.getElementById('downloadBtn');
            const appVersionText = document.getElementById('appVersionText');
            const appSizeText = document.getElementById('appSizeText');
            const downloadCountText = document.getElementById('downloadCountText');
            const appRatingText = document.getElementById('appRatingText');
            const menuAppVersion = document.getElementById('menuAppVersion');

            if (downloadBtn && data.downloadUrl) {
                downloadBtn.href = data.downloadUrl;
                downloadBtn.setAttribute('target', '_blank');
                
                downloadBtn.onclick = async () => {
                    try {
                        await updateDoc(docRef, {
                            downloadCount: increment(1)
                        });
                    } catch (err) {
                        console.error("Error updating download count:", err);
                    }
                };
            }

            if (appVersionText && data.version) appVersionText.innerText = "v" + data.version;
            if (appSizeText && data.size) appSizeText.innerText = data.size + " MB";
            if (menuAppVersion && data.version) menuAppVersion.innerText = data.version;
            
            if (downloadCountText) {
                const count = data.downloadCount !== undefined ? data.downloadCount : 0;
                downloadCountText.innerText = `📥 ${count} Downloads`;
            }

            if (appRatingText) {
                const currentRating = data.rating !== undefined ? Number(data.rating).toFixed(1) : "0.0";
                const reviewsCount = data.reviewsCount !== undefined ? data.reviewsCount : 0;
                appRatingText.innerText = `⭐ ${currentRating} (${reviewsCount} Reviews)`;
            }
        }

        // --- نظام التقييم الثابت عبر localStorage ---
        const ratingStars = document.querySelectorAll('.rating-star');
        const submitRatingBtn = document.getElementById('submitRatingBtn');
        const ratingMessage = document.getElementById('ratingMessage');
        
        let selectedRating = 0;
        const savedUserRating = localStorage.getItem('awalify_user_rating');

        // دالة لتلوين النجوم
        function highlightStars(count) {
            ratingStars.forEach((s, idx) => {
                if (idx < count) {
                    s.classList.add('text-yellow-400');
                    s.classList.remove('text-gray-300');
                } else {
                    s.classList.remove('text-yellow-400');
                    s.classList.add('text-gray-300');
                }
            });
        }

        // إذا كان المستخدم قد قيّم مسبقاً، نعرض تقييمه مباشرة ونعطل الزر
        if (savedUserRating) {
            selectedRating = parseInt(savedUserRating);
            highlightStars(selectedRating);
            if (submitRatingBtn) {
                submitRatingBtn.disabled = true;
                submitRatingBtn.classList.add("opacity-50", "cursor-not-allowed");
                submitRatingBtn.innerText = "Already Rated";
            }
            if (ratingMessage) {
                ratingMessage.innerText = `You have already rated this app (${selectedRating} Stars). Thank you!`;
                ratingMessage.classList.remove("hidden");
            }
        }

        // تفاعل النجوم عند الضغط (فقط إذا لم يقيّم من قبل)
        if (!savedUserRating && ratingStars.length > 0) {
            ratingStars.forEach(star => {
                star.addEventListener('click', (e) => {
                    e.preventDefault();
                    selectedRating = parseInt(star.getAttribute('data-value'));
                    highlightStars(selectedRating);
                });
            });
        }

        // إرسال التقييم وحفظه
        if (submitRatingBtn && !savedUserRating) {
            submitRatingBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                if (selectedRating === 0) {
                    alert("Please select at least one star first!");
                    return;
                }

                try {
                    const freshSnap = await getDoc(docRef);
                    if (!freshSnap.exists()) return;
                    
                    const freshData = freshSnap.data();
                    const oldRating = freshData.rating || 0;
                    const oldReviews = freshData.reviewsCount || 0;
                    
                    const newReviews = oldReviews + 1;
                    const newRating = ((oldRating * oldReviews) + selectedRating) / newReviews;

                    // تحديث في Firebase
                    await updateDoc(docRef, {
                        rating: parseFloat(newRating.toFixed(1)),
                        reviewsCount: newReviews
                    });

                    // حفظ في ذاكرة المتصفح باش يبقى عاقل عليه
                    localStorage.setItem('awalify_user_rating', selectedRating);

                    if (ratingMessage) {
                        ratingMessage.innerText = "Thank you! Your rating has been submitted successfully.";
                        ratingMessage.classList.remove("hidden");
                    }
                    
                    submitRatingBtn.disabled = true;
                    submitRatingBtn.classList.add("opacity-50", "cursor-not-allowed");
                    submitRatingBtn.innerText = "Already Rated";
                    
                    const appRatingText = document.getElementById('appRatingText');
                    if (appRatingText) {
                        appRatingText.innerText = `⭐ ${newRating.toFixed(1)} (${newReviews} Reviews)`;
                    }

                } catch (err) {
                    console.error("Error submitting rating:", err);
                    alert("Failed to submit rating.");
                }
            });
        }

    } catch (error) {
        console.error("Firestore sync error:", error);
    }
}

document.addEventListener("DOMContentLoaded", initAwalifyPlatform());
