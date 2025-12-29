import { useInView } from "react-intersection-observer";

export default function ViewportRender({ children, threshold = 0.3 }) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: false,
  });

  return (
    <div ref={ref} style={{ minHeight: "1px" }}>
      {inView ? children : null}
    </div>
  );
}
