/* Browser smoke for MenujuKita's offline/demo workflow; never touches production DB. */
const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:3000/demo",{waitUntil:"domcontentloaded",timeout:45000});
  await page.locator(".demo-mode-banner").waitFor({timeout:20000});
  await page.locator(".studio-rail button").filter({hasText:"Rencana"}).first().click();
  await page.getByRole("heading",{name:"Wedding Journey"}).waitFor();
  const panel=page.locator("details.composer-card").filter({hasText:"Tambah task"}).first();
  await panel.locator("summary").click();
  await panel.locator('input[name="title"]').fill("QA CHECKLIST TERSIMPAN");
  await panel.getByRole("button",{name:"Tambah Task"}).click();
  await page.getByText("QA CHECKLIST TERSIMPAN").first().waitFor();
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator(".studio-rail button").filter({hasText:"Rencana"}).first().click();
  await page.getByText("QA CHECKLIST TERSIMPAN").first().waitFor();
  await page.locator(".demo-top-actions button").filter({hasText:"Reset Demo"}).click();
  await page.locator(".studio-rail button").filter({hasText:"Rencana"}).first().click();
  if(await page.getByText("QA CHECKLIST TERSIMPAN").count())throw Error("Reset Demo failed");
  await page.locator(".studio-rail button").filter({hasText:"Dana"}).first().click();
  await page.getByText("Uang benar-benar terkumpul").first().waitFor();
  for(const [label,heading] of [
   ["Konsep","Konsep & Mood Board"],
   ["Seserahan","Daftar Seserahan"],
   ["Diskusi Berdua","Diskusi Berdua"],
   ["Panduan","Belajar sambil menyiapkan wedding."]
  ]){
   await page.locator(".studio-rail button.rail-more").click();
   await page.locator(".studio-more-sheet").waitFor({state:"visible"});
   await page.locator(".studio-more-sheet .more-grid button").filter({hasText:label}).first().click();
   await page.getByRole("heading",{name:heading}).first().waitFor({timeout:15000});
  }
  await page.setViewportSize({width:390,height:844});
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("nav.studio-mobile-nav").waitFor();
  await page.locator("nav.studio-mobile-nav button").filter({hasText:"Lainnya"}).click();
  await page.locator(".more-grid button").filter({hasText:"Panduan"}).first().click();
  await page.getByRole("heading",{name:"Belajar sambil menyiapkan wedding."}).waitFor();
  const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth));
  if(overflow>4)throw Error("Mobile horizontal overflow "+overflow+" px");
  if(errors.length)throw Error("Browser runtime exceptions: "+errors.slice(0,4).join(" | "));
  console.log("PASS: navigation, guided modules, checklist CRUD, persistence, reset, responsive mobile; no unhandled browser errors");
  await browser.close();
}
main().catch(e=>{console.error("SMOKE FAILED",e.stack||e);process.exit(1)});
