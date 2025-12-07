import { Video } from "@/types/videos/videos";
import axios from "axios";
import { useState, useEffect } from "react";

const useGetAllSubVideo = (subcategoryId: string) => {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/reels?subcategory=${subcategoryId}`
        );
        setVideos(response.data);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return { videos, loading };
};

export default useGetAllSubVideo;
