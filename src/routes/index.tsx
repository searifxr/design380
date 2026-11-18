import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/site.css?raw";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Car Interior Customization Simulator" }] }),
  staticData: { importedDocument: { html: { "lang": "en" }, body: {  } } },
  component: Index,
});

function Index() {
  return (
    <>
      <style>{capturedCSS}</style>
      <div className={"\x63ontainer max-w-[1400px]"}>
        <header className="text-site-import-primary text-center">
          <h1 className="text-[2rem] font-semibold tracking-[1px]">CAR INTERIOR CUSTOMIZATION SIMULATOR</h1>
        </header>
        <div className="main-content bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] border border-solid border-site-import-border rounded-[8px]">
          <section className="car-selection">
            <h2 className="text-site-import-primary text-[1.2rem] font-semibold">Select Car Type</h2>
            <div className="flex gap-[15px]"><button className="car-type-btn active bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-accent cursor-pointer flex-1 text-[1rem] font-semibold duration-200">
                              Sedan
                          </button><button className="car-type-btn bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background cursor-pointer flex-1 text-[1rem] font-semibold duration-200">
                              SUV
                          </button><button className="car-type-btn bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background cursor-pointer flex-1 text-[1rem] font-semibold duration-200">
                              Truck
                          </button></div>
          </section>
          <div className="flex gap-[20px] min-h-[600px]">
            <ImportedAside />
            <main className="flex flex-1 flex-col gap-[15px]">
              <div className="car-interior-wrapper items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background border-2 border-solid border-site-import-border rounded-[8px] flex justify-center min-h-[800px] relative">
                <div className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#0a0a0a80] h-[700px] relative w-[450px]" id="carContainer">
                  <div className="h-full left-0 pointer-events-none absolute top-0 w-full z-100">
                    <svg className="h-full w-full" viewBox="0 0 400 650" xmlns="http://www.w3.org/2000/svg">
                      <path d={"M 100 40 \n                         Q 100 25, 115 20\n                         L 285 20\n                         Q 300 25, 300 40\n                         L 315 120\n                         L 320 400\n                         L 315 560\n                         L 310 610\n                         Q 305 625, 290 630\n                         L 110 630\n                         Q 95 625, 90 610\n                         L 85 560\n                         L 80 400\n                         L 85 120\n                         Z"} fill="rgba(255, 215, 0, 0.08)" stroke="#ffd700" strokeWidth="3" opacity="0.7" />
                      <rect x="95" y="30" width="210" height="110" fill="rgba(50, 50, 50, 0.4)" stroke="#555" strokeWidth="1.5" opacity="0.9" />
                      <text x="200" y="90" fontSize="16" fill="#666" textAnchor="middle" opacity="0.9">ENGINE</text>
                      <rect x="95" y="510" width="210" height="110" fill="rgba(50, 50, 50, 0.4)" stroke="#555" strokeWidth="1.5" opacity="0.9" />
                      <text x="200" y="570" fontSize="16" fill="#666" textAnchor="middle" opacity="0.9">TRUNK</text>
                    </svg>
                  </div>
                  <div className="absolute left-[105px] top-[150px] w-[190px] h-[110px] [background:rgb(26,_26,_26)] flex items-center justify-center [color:rgb(255,_215,_0)] [font-weight:bold] [font-size:14px] pointer-events-none [z-index:50]" style={{ border: "2px solid rgb(255, 215, 0)", borderRadius: "4px" }}>
                    <div className="text-center">
                      <div className="[font-size:22px]" style={{ marginBottom: "5px" }}>88:88</div>
                      <div className="[font-size:10px]">DASHBOARD</div>
                    </div>
                  </div>
                  <svg className="absolute left-[110px] top-[175px] w-[60px] h-[60px] pointer-events-none [z-index:51]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="46" fill="#0a0a0a" stroke="#ffd700" strokeWidth="3" />
                    <circle cx="50" cy="50" r="36" fill="none" stroke="#ffd700" strokeWidth="3.5" />
                    <circle cx="50" cy="50" r="10" fill="#ffd700" />
                    <line x1="50" y1="14" x2="50" y2="33" stroke="#ffd700" strokeWidth="3" />
                  </svg>
                  <div className="absolute left-[120px] top-[270px] w-[50px] h-[65px] [background:rgb(42,_42,_42)] pointer-events-none [z-index:49]" style={{ border: "2px solid rgb(255, 215, 0)", borderRadius: "5px" }}>
                    <div className="h-[calc(100%_-_10px)] [background:rgb(26,_26,_26)] [border-radius:3px]" style={{ margin: "5px" }} />
                  </div>
                  <div className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-accent border border-dashed border-[#555555] rounded-[4px] absolute left-[105px] top-[310px] w-[190px] h-[190px]" id="interiorZone" />
                </div>
                <div className="drag-preview hidden opacity-80 pointer-events-none fixed z-1000" id="dragPreview" />
              </div>
              <div className="component-menu bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] border-2 border-solid border-site-import-primary rounded-[4px] hidden flex-row gap-[5px] fixed z-1000" id="componentMenu"><button className={"menu-btn items-center cursor-pointer flex text-[1.2rem] h-[35px] justify-center duration-200 w-[35px] [&:active]:[transform:scale(0.95)]"} id="moveBtn" title="Move">✋</button><button className={"menu-btn items-center cursor-pointer flex text-[1.2rem] h-[35px] justify-center duration-200 w-[35px] [&:active]:[transform:scale(0.95)]"} id="rotateBtn" title="Rotate">↻</button><button className={"menu-btn items-center cursor-pointer flex text-[1.2rem] h-[35px] justify-center duration-200 w-[35px] [&:active]:[transform:scale(0.95)]"} id="deleteBtn" title="Delete">✕</button></div>
              <div className="controls items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background border border-solid border-site-import-border rounded-[4px] flex justify-between">
                <button className="btn-clear border-2 border-solid border-site-import-primary rounded-[4px] cursor-pointer text-[0.9rem] font-semibold duration-200" id="clearAll">Clear All</button>
                <div className="info text-site-import-muted-foreground flex text-[0.9rem] font-semibold gap-[20px]"><span className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] border border-solid border-site-import-border rounded-[4px]" id="carTypeInfo">Current: Sedan</span><span className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] border border-solid border-site-import-border rounded-[4px]" id="componentCount">Components: 0</span></div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

function ImportedAside() {
  return (
    <aside className="component-library bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background border border-solid border-site-import-border rounded-[4px] w-[250px]">
      <h3 className="text-site-import-primary text-[1rem] font-semibold">Components</h3>
      <div className="flex flex-col gap-[10px]">
        <div className="component-item items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] flex flex-col gap-[8px] duration-200"><svg className="h-[50px] w-[60px]" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">{"\n                                "}<rect x="5" y="10" width="90" height="10" fill="#555" stroke="#ffd700" strokeWidth="2" />{"\n                                "}<rect x="10" y="20" width="5" height="20" fill="#444" />{"\n                                "}<rect x="85" y="20" width="5" height="20" fill="#444" />{"\n                            "}</svg><span>Shelf</span></div>
        <div className="component-item items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] flex flex-col gap-[8px] duration-200"><svg className="h-[50px] w-[60px]" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">{"\n                                "}<circle cx="40" cy="40" r="35" fill="#222" stroke="#ffd700" strokeWidth="2" />{"\n                                "}<circle cx="40" cy="40" r="25" fill="#111" stroke="#555" strokeWidth="1" />{"\n                                "}<circle cx="40" cy="40" r="15" fill="#333" stroke="#555" strokeWidth="1" />{"\n                            "}</svg><span>Speaker</span></div>
        <div className="component-item items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] flex flex-col gap-[8px] duration-200"><svg className="h-[50px] w-[60px]" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">{"\n                                "}<rect x="10" y="10" width="80" height="60" fill="#333" stroke="#ffd700" strokeWidth="2" rx="4" />{"\n                                "}<rect x="20" y="30" width="60" height="3" fill="#555" />{"\n                                "}<circle cx="50" cy="42" r="5" fill="#ffd700" />{"\n                            "}</svg><span>Storage Box</span></div>
        <div className="component-item items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] flex flex-col gap-[8px] duration-200"><svg className="h-[50px] w-[60px]" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">{"\n                                "}<circle cx="30" cy="30" r="25" fill="#222" stroke="#ffd700" strokeWidth="2" />{"\n                                "}<circle cx="30" cy="30" r="18" fill="#111" />{"\n                                "}<ellipse cx="30" cy="28" rx="16" ry="4" fill="#333" />{"\n                            "}</svg><span>Cup Holder</span></div>
        <div className="component-item items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] flex flex-col gap-[8px] duration-200"><svg className="h-[50px] w-[60px]" viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">{"\n                                "}<rect x="10" y="10" width="80" height="50" fill="#111" stroke="#ffd700" strokeWidth="2" rx="3" />{"\n                                "}<rect x="15" y="15" width="70" height="40" fill="#1a3d5c" />{"\n                                "}<text x="50" y="40" fontSize="12" fill="#ffd700" textAnchor="middle">SCREEN</text>{"\n                            "}</svg><span>Display Screen</span></div>
        <div className="component-item items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#1a1a1a] flex flex-col gap-[8px] duration-200"><svg className="h-[50px] w-[60px]" viewBox="0 0 90 50" xmlns="http://www.w3.org/2000/svg">{"\n                                "}<rect x="5" y="5" width="80" height="40" fill="#2a2a2a" stroke="#ffd700" strokeWidth="2" rx="3" />{"\n                                "}<circle cx="22" cy="25" r="6" fill="#0a0a0a" stroke="#555" strokeWidth="1" />{"\n                                "}<circle cx="45" cy="25" r="6" fill="#0a0a0a" stroke="#555" strokeWidth="1" />{"\n                                "}<circle cx="68" cy="25" r="6" fill="#0a0a0a" stroke="#555" strokeWidth="1" />{"\n                            "}</svg><span>Mini Bar</span></div>
      </div>
    </aside>
  );
}
