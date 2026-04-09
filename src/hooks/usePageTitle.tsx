import { useEffect } from "react";

const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | NSB Log Management`;
  }, [title]);
};

export default usePageTitle;