// This edition is manually curated. Never fetch the original author's accounts.
export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({mode:'curated'});
}
