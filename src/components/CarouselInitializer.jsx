import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const CarouselInitializer = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const cleanups = [];

    // Small delay to ensure current page DOM has mounted
    const timer = setTimeout(() => {
      // 1. Initialize all [data-carousel] components
      const carousels = document.querySelectorAll("[data-carousel]");
      carousels.forEach((carousel) => {
        const track = carousel.querySelector("[data-carousel-track]");
        const slides = Array.from(track?.querySelectorAll("[data-carousel-slide]") ?? []);
        const previous = carousel.querySelector("[data-carousel-prev]");
        const next = carousel.querySelector("[data-carousel-next]");
        const indicators = Array.from(carousel.querySelectorAll("[data-carousel-to]"));

        if (!track || slides.length < 2) return;

        let activeIndex = 0;
        let autoplayTimer = null;

        const updateActiveSlide = () => {
          const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
          activeIndex = slides.reduce((closestIndex, slide, index) => {
            const slideRect = slide.getBoundingClientRect();
            const closestRect = slides[closestIndex].getBoundingClientRect();
            const slideCenter = slideRect.left + slideRect.width / 2;
            const closestCenter = closestRect.left + closestRect.width / 2;
            return Math.abs(slideCenter - trackCenter) < Math.abs(closestCenter - trackCenter)
              ? index
              : closestIndex;
          }, 0);

          slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === activeIndex);
            slide.setAttribute("aria-hidden", String(index !== activeIndex));
          });

          indicators.forEach((indicator, index) => {
            const isActive = index === activeIndex;
            indicator.classList.toggle("active", isActive);
            if (isActive) indicator.setAttribute("aria-current", "true");
            else indicator.removeAttribute("aria-current");
          });
        };

        const goToSlide = (index) => {
          activeIndex = (index + slides.length) % slides.length;
          const trackRect = track.getBoundingClientRect();
          const slideRect = slides[activeIndex].getBoundingClientRect();
          track.scrollTo({
            left: track.scrollLeft + slideRect.left - trackRect.left,
            behavior: "smooth",
          });
        };

        const handlePrev = () => goToSlide(activeIndex - 1);
        const handleNext = () => goToSlide(activeIndex + 1);

        previous?.addEventListener("click", handlePrev);
        next?.addEventListener("click", handleNext);

        const indicatorCleanups = indicators.map((indicator, index) => {
          const handler = (event) => {
            event.preventDefault();
            goToSlide(index);
          };
          indicator.addEventListener("click", handler);
          return () => indicator.removeEventListener("click", handler);
        });

        track.addEventListener("scroll", updateActiveSlide, { passive: true });
        window.addEventListener("resize", updateActiveSlide);
        updateActiveSlide();

        const interval = Number(carousel.dataset.carouselInterval);
        let startAutoplay = null;
        let stopAutoplay = null;

        if (interval > 0) {
          startAutoplay = () => {
            if (autoplayTimer) clearInterval(autoplayTimer);
            autoplayTimer = setInterval(() => goToSlide(activeIndex + 1), interval);
          };
          stopAutoplay = () => {
            if (autoplayTimer) {
              clearInterval(autoplayTimer);
              autoplayTimer = null;
            }
          };

          carousel.addEventListener("mouseenter", stopAutoplay);
          carousel.addEventListener("mouseleave", startAutoplay);
          carousel.addEventListener("focusin", stopAutoplay);
          carousel.addEventListener("focusout", startAutoplay);
          startAutoplay();
        }

        cleanups.push(() => {
          previous?.removeEventListener("click", handlePrev);
          next?.removeEventListener("click", handleNext);
          indicatorCleanups.forEach((fn) => fn());
          track.removeEventListener("scroll", updateActiveSlide);
          window.removeEventListener("resize", updateActiveSlide);
          if (stopAutoplay) {
            stopAutoplay();
            carousel.removeEventListener("mouseenter", stopAutoplay);
            carousel.removeEventListener("mouseleave", startAutoplay);
            carousel.removeEventListener("focusin", stopAutoplay);
            carousel.removeEventListener("focusout", startAutoplay);
          }
        });
      });

      // 2. Initialize related machines carousel buttons on MachineDetails if present
      const relPrev = document.getElementById("related-prev");
      const relNext = document.getElementById("related-next");
      const relTrack = document.querySelector(".related-machine-track");
      if (relTrack) {
        const scrollAmount = 320;
        const onRelPrev = () => relTrack.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        const onRelNext = () => relTrack.scrollBy({ left: scrollAmount, behavior: "smooth" });
        relPrev?.addEventListener("click", onRelPrev);
        relNext?.addEventListener("click", onRelNext);
        cleanups.push(() => {
          relPrev?.removeEventListener("click", onRelPrev);
          relNext?.removeEventListener("click", onRelNext);
        });
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return null;
};

export default CarouselInitializer;
