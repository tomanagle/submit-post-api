import buildCaption from "../buildCaption";

describe("build caption", () => {
  it("should", () => {
    // @ts-ignore
    expect(
      buildCaption(
        // @ts-ignore
        {
          name: "David McDonald",
          instagramHandle: "davidmcdonald89",
          twitterHandle: "davidmcdonald89",
          location: "Australia",
          status: "pending",
          image:
            "https://res.cloudinary.com/tomnagle/image/upload/c_thumb,w_1500,h_1500/c_scale,g_south_west,l_frames:frame_10,w_1500,x_0,y_0/v1642747288/posts/5_0_2022/dNH99coZb0c0pzy8aHZoQ.jpeg",
        },
        "instagram"
      )
    ).toBe(
      "David McDonald from Australia, had a positive vaccine experience, they are now safe and vaxxed. Thank you @davidmcdonald89 for sharing your story. #safeandvaxxed"
    );

    // @ts-ignore
    expect(
      buildCaption(
        // @ts-ignore
        {
          name: "David McDonald",
          instagramHandle: "davidmcdonald89",
          twitterHandle: "davidmcdonald89",
          location: "Australia",
          status: "pending",
          image:
            "https://res.cloudinary.com/tomnagle/image/upload/c_thumb,w_1500,h_1500/c_scale,g_south_west,l_frames:frame_10,w_1500,x_0,y_0/v1642747288/posts/5_0_2022/dNH99coZb0c0pzy8aHZoQ.jpeg",
        },
        "twitter"
      )
    ).toBe(
      "David McDonald from Australia, had a positive vaccine experience, they are now safe and vaxxed. Thank you davidmcdonald89 for sharing your story. #safeandvaxxed"
    );

    expect(
      buildCaption(
        // @ts-ignore
        {
          name: "David McDonald",
          status: "pending",
          image:
            "https://res.cloudinary.com/tomnagle/image/upload/c_thumb,w_1500,h_1500/c_scale,g_south_west,l_frames:frame_10,w_1500,x_0,y_0/v1642747288/posts/5_0_2022/dNH99coZb0c0pzy8aHZoQ.jpeg",
        },
        "twitter"
      )
    ).toBe(
      "David McDonald had a positive vaccine experience, they are now safe and vaxxed. Thank you for sharing your story. #safeandvaxxed"
    );
  });
});
