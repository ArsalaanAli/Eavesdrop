import cohere
import os 
import json
from dotenv import load_dotenv

def get_documents():
    return [
        {
            "title": "2024 Trump Platform. CHAPTER ONE: DEFEAT INFLATION AND QUICKLY BRING DOWN ALL PRICES",
            "snippet": """Our Commitment:
            The Republican Party will reverse the worst Inflation crisis in four decades that has crushed the middle class, devastated
            family budgets, and pushed the dream of homeownership out of reach for millions. We will defeat Inflation, tackle the costof-living crisis, improve fiscal sanity, restore price stability, and quickly bring down prices.
            Inflation is a crushing tax on American families. History shows that Inflation will not magically disappear while policies
            remain the same. We commit to unleashing American Energy, reining in wasteful spending, cutting excessive Regulations,
            securing our Borders, and restoring Peace through Strength. Together, we will restore Prosperity, ensure Economic Security,
            and build a brighter future for American Workers and their families. Our dedication to these Policies will make America
            stronger, more resilient, and more prosperous than ever before.
            1. Unleash American Energy
            Under President Trump, the U.S. became the Number One Producer of Oil and Natural Gas in the World — and we will soon
            be again by lifting restrictions on American Energy Production and terminating the Socialist Green New Deal. Republicans
            will unleash Energy Production from all sources, including nuclear, to immediately slash Inflation and power American
            homes, cars, and factories with reliable, abundant, and affordable Energy.
            2. Rein in Wasteful Federal Spending
            Republicans will immediately stabilize the Economy by slashing wasteful Government spending and promoting Economic
            Growth.
            3. Cut Costly and Burdensome Regulations
            Republicans will reinstate President Trump's Deregulation Policies, which saved Americans $11,000 per household, and
            end Democrats’ regulatory onslaught that disproportionately harms low- and middle-income households.
            4. Stop Illegal Immigration
            Republicans will secure the Border, deport Illegal Aliens, and reverse the Democrats’ Open Borders Policies that have
            driven up the cost of Housing, Education, and Healthcare for American families.
            5. Restore Peace through Strength
            War breeds Inflation while geopolitical stability brings price stability. Republicans will end the global chaos and restore
            Peace through Strength, reducing geopolitical risks and lowering commodity prices.""",
        },
        {
            "title": "2024 Trump Platform. CHAPTER TWO: SEAL THE BORDER, AND STOP THE MIGRANT INVASION",
            "snippet": """Our Commitment:
            Republicans offer an aggressive plan to stop the open-border policies that have opened the floodgates to a tidal wave of
            illegal Aliens, deadly drugs, and Migrant Crime. We will end the Invasion at the Southern Border, restore Law and Order,
            protect American Sovereignty, and deliver a Safe and Prosperous Future for all Americans.
            1. Secure the Border
            Republicans will restore every Border Policy of the Trump administration and halt all releases of Illegal Aliens into the
            interior. We will complete the Border Wall, shift massive portions of Federal Law Enforcement to Immigration Enforcement,
            and use advanced technology to monitor and secure the Border. We will use all resources needed to stop the Invasion—
            including moving thousands of Troops currently stationed overseas to our own Southern Border. We will deploy the U.S.
            Navy to impose a full Fentanyl Blockade on the waters of our Region—boarding and inspecting ships to look for fentanyl and
            fentanyl precursors. Before we defend the Borders of Foreign Countries, we must first secure the Border of our Country.
            2. Enforce Immigration Laws
            Republicans will strengthen ICE, increase penalties for illegal entry and overstaying Visas, and reinstate “Remain in
            Mexico” and other Policies that helped reduce Illegal Immigration by historic lows in President Trump’s first term. We will
            also invoke the Alien Enemies Act to remove all known or suspected gang members, drug dealers, or cartel members from
            the United States, ending the scourge of Illegal Alien gang violence once and for all. We will bring back the Travel Ban, and
            use Title 42 to end the child trafficking crisis by returning all trafficked children to their families in their Home Countries
            immediately.
            3. Begin Largest Deportation Program in American History
            President Trump and Republicans will reverse the Democrats’ destructive Open Borders Policies that have allowed criminal
            gangs and Illegal Aliens from around the World to roam the United States without consequences. The Republican Party is
            committed to sending Illegal Aliens back home and removing those who have violated our Laws.
            4. Strict Vetting
            Republicans will use existing Federal Law to keep foreign Christian-hating Communists, Marxists, and Socialists out of
            America. Those who join our Country must love our Country. We will use extreme vetting to ensure that jihadists and jihadist
            sympathizers are not admitted.
            5. Stop Sanctuary Cities
            Republicans will cut federal Funding to sanctuary jurisdictions that release dangerous Illegal Alien criminals onto our
            streets, rather than handing them over to ICE. We will require local cooperation with Federal Immigration Enforcement.
            6. Ensure Our Legal Immigration System Puts American Workers First
            Republicans will prioritize Merit-based immigration, ensuring those admitted to our Country contribute positively to our
            Society and Economy, and never become a drain on Public Resources. We will end Chain Migration, and put American
            Workers first!"""
        },
        {
            "title": "2024 Trump Platform.",
            "snippet": """
            1. SEAL THE BORDER, AND STOP THE MIGRANT INVASION
            2. CARRY OUT THE LARGEST DEPORTATION OPERATION IN AMERICAN HISTORY
            3. END INFLATION, AND MAKE AMERICA AFFORDABLE AGAIN
            4. MAKE AMERICA THE DOMINANT ENERGY PRODUCER IN THE WORLD, BY FAR!
            5. STOP OUTSOURCING, AND TURN THE UNITED STATES INTO A MANUFACTURING SUPERPOWER
            6. LARGE TAX CUTS FOR WORKERS, AND NO TAX ON TIPS!
            7. DEFEND OUR CONSTITUTION, OUR BILL OF RIGHTS, AND OUR FUNDAMENTAL FREEDOMS,
            INCLUDING FREEDOM OF SPEECH, FREEDOM OF RELIGION, AND THE RIGHT TO KEEP AND BEAR
            ARMS
            8. PREVENT WORLD WAR THREE, RESTORE PEACE IN EUROPE AND IN THE MIDDLE EAST, AND BUILD A
            GREAT IRON DOME MISSILE DEFENSE SHIELD OVER OUR ENTIRE COUNTRY -- ALL MADE IN AMERICA
            9. END THE WEAPONIZATION OF GOVERNMENT AGAINST THE AMERICAN PEOPLE
            10. STOP THE MIGRANT CRIME EPIDEMIC, DEMOLISH THE FOREIGN DRUG CARTELS, CRUSH GANG
            VIOLENCE, AND LOCK UP VIOLENT OFFENDERS"""
        }
    ]

def rag_model(text):
    load_dotenv()
    co = cohere.Client(api_key=os.getenv("COHERE_KEY"))

    prompt = """
        You are a professional fact checker who checks text for any statements that may need to be fact checked.

        Given the following text, I want you to:
        (1) identify if there exists any statements that may or may not be true or is misleading, 
        (2) for each statement that should be fact checked, do all of steps 3-7, where each step is defined as follows:
        (3) pinpoint an exact quote of a statement within the text that should be highlighted as being fact checked,
        (4) provide a brief 2-sentence summary of the statement that is being fact checked as content,
        (6) provide a truthiness score between 0 and 1, where 0 is definitely false and 1 is definitely true,
        (7) provide a list of 2 citations that can be used to verify the truthiness of the statement. For each citation, provide a URL to the source of the citation and absolutely ensure that this URL leads to an existing website that is not 404 NOT FOUND.
        (8) if there are no statements that need to be fact checked, return an empty list.
                
        Here is an example. 
        - input text: "All bacteria are harmful. This is why you have to wash your hands often to prevent diseases."
        - your response: 
            - "Incorrect. While some bacteria can cause illness, there are beneficial bacteria, known as probiotics, that play crucial roles in various bodily functions" 
            - truthiness score: 0.2
            - citations: [https://www.ncbi.nlm.nih.gov/books/NBK209710/, https://www.healthline.com/health/bacteria]

        You must respond in a json-like form, which should be in this format: 
            truthiness: type: integer ,
            highlight: exact string from the text to highlight. type: string ,
            content: explanation on the topic. type: integer ,
            citations: type: string[]
                            
        Text: {0}
        """.format(text)

    res = co.chat(
        model="command-r-plus",
        message=prompt,
        search_queries_only=False,
        documents=get_documents()
    )

    json_string = res.text[8:-3]

rag_model("Trump plans to increase outsourcing in the manufacturing sector.")


