const Footer = () => {
  return (
    <div className="flex w-full items-center justify-center gap-2 bg-white/5 p-4 text-white shadow-lg">
      <p className="">
        Data collected from IMDb. See more of my work at{" "}
        <a
          href="https://anforsm.com"
          target="_blank"
          rel="noreferrer"
          className=" text-blue-400 hover:underline"
        >
          anforsm.com
        </a>
        .
      </p>
    </div>
  );
};

export default Footer;
