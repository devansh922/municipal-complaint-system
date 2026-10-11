"""Honest evaluation: train on dataset.csv, test on test_set.csv (complaints the model never saw).
Compares the Random Forest with a simple keyword rule and with always guessing the most common label.
Run:  pip install scikit-learn pandas   then   python evaluate_models.py
"""
import re
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.pipeline import make_pipeline

train = pd.read_csv("dataset.csv")
test = pd.read_csv("test_set.csv")

KEYWORDS = {
 "Roads & Potholes": ["pothole","road","crack","footpath","pavement","speed breaker"],
 "Water Supply": ["water","pipe","leak","tap","supply","sewage","drain","overflow"],
 "Garbage & Sanitation": ["garbage","waste","trash","dustbin","smell","dump","toilet","clean"],
 "Street Lights": ["light","lamp","dark","pole","bulb"],
 "Stray Animals": ["dog","cattle","cow","stray","monkey","animal"]}
SEVERE = r"accident|danger|injur|attack|bite|bitten|sick|shock|fall|fell|burst|flood|overflow|sewage|dirty|contaminat|burn|rabid|snake|hospital|child|women|unsafe|medical|spark|dead|caved|manhole|slip|crack|leaning|smoke|breath|no water|bull"
LONG = r"days|weeks|months|since|never|continuous|always|regular|every"
MINOR = r"dim|faded|blink|bench|noise|marking|need new|steriliz|meter|daytime|rusted|bump|dust|stone|tiles|bill|certificate"
def flags(t):
    l = t.lower()
    hits = "".join(" zk" + c[:2].lower().replace(" ", "") for c, ks in KEYWORDS.items() if any(k in l for k in ks))
    return t + hits + (" zsevere" if re.search(SEVERE, l) else "") + (" zlong" if re.search(LONG, l) else "") + (" zminor" if re.search(MINOR, l) else "")

URGENT = ["accident","danger","injur","urgent","manhole","shock","fire","flood","fell","collapse","slipp","child","hospital"]

def keyword_category(t):
    t = t.lower()
    score = {c: sum(k in t for k in ks) for c, ks in KEYWORDS.items()}
    best = max(score, key=score.get)
    return best if score[best] > 0 else "Other"
def keyword_priority(t):
    return "High" if any(k in t.lower() for k in URGENT) else "Medium"

def rf():
    return make_pipeline(CountVectorizer(binary=True, stop_words="english"),
                         RandomForestClassifier(n_estimators=60, random_state=7))

rows = []
for target, kw in [("category", keyword_category), ("priority", keyword_priority)]:
    model = rf().fit(train["text"].map(flags), train[target])
    rf_acc = (model.predict(test["text"].map(flags)) == test[target]).mean()
    kw_acc = (test["text"].map(kw) == test[target]).mean()
    majority = train[target].mode()[0]
    maj_acc = (test[target] == majority).mean()
    rows.append((target, maj_acc, kw_acc, rf_acc))

print(f"Trained on {len(train)} complaints, tested on {len(test)} unseen complaints\n")
print(f"{'target':10} {'always-most-common':>20} {'keyword rule':>14} {'random forest':>15}")
for t, a, b, c in rows:
    print(f"{t:10} {a:20.0%} {b:14.0%} {c:15.0%}")
