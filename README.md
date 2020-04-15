# Project of Data Visualization (COM-480)

[Milestone 1](#milestone-1-friday-3rd-april-5pm) • [Milestone 2](#milestone-2-friday-1st-may-5pm) • [Milestone 3](#milestone-3-thursday-28th-may-5pm)

## Milestone 1 (Friday 3rd April, 5pm)
**10% of the final grade**

## _Physical and human resources  in the healthcare system in Switzerland_
### Problematic
In the context of COVID19, physical and human resources in the healthcare system are at the center of the crisis. The _#stayathome_ movement is specifically important to slow down the propagation of the virus and avoid an overwhelming situation in hospitals and clinics. 

In Switzerland, there has been a tremendous effort to bring new beds in acute units. Medicine students and retired health practionners have been requisionned to help on different services. These measures highlight the critical aspect of physical and human resources in these difficult times. 

According to the Health System Review 2015 from WHO Regional Office for Europe [1], **the number of beds** in acute care hospitals was reduced by about 20% between 2000 and 2013 in Switzerland: _“There were 2.9 beds in acute care hospitals per 1000 people in Switzerland in 2013, which was below the EU average of 3.6 beds per 1000 people. (…) The average length of stay in acute care hosptial fell by 37% since 2000 to 5.9 days in 2013, which was also below the EU average of 6.3 days.”_ 

In terms of **human resources**, _“the number of physicians and nurses per 1000 population was amongst the highest in Europe. With 4.1 physicians and 17.7 nurses per 1000 inhabitants, Switzerland had the second highest combined number of physicians and nurses after Monaco in the entire European Region.”_

In this project, I’d like to look back on healthcare human and physical resources  in Switzerland over the past 10-20 years, especially on the metrics just mentionned. I will analyze the trends using interactive data visualization - for instance on an interactive 2D map. 

I’m interested in the evolution over the years and the possible correlation of the country wealth, healthcare quality and number of resources. I’m also keen on a feminist approach which would tend to pinpoint how woman practionners are currently more impacted during the pandemic as they outnumber man practionners in “low-category” jobs in the field of care.

### Exploratory Data Analysis

Three datasets have been selected on [opendata.swiss] (https://opendata.swiss/en/). Here is a brief exploration of each of them, giving the years, categories and sub-categories by which the data are sorted.

**[Dataset 1] Cas d’hospitalisations**

    Years           | 2001-2018
    Categories      | Hôpitaux de soins généraux
                    | Cliniques psychiatriques
                    | Cliniques de réadaptation
                    | Autres cliniques spécialisées
    Sub-Categories  | Nombre de sortie
                    | Durée moyenne de séjour
	 
The average length of stay in 2018 with respect to the different sectors has been plotted on Figure 1, and the number of patients going out with respect to the different sectors stands on Figure 2. 

![Figure 1](/figure/Figure12.png)

In Figure 1, we can see that the average length of stay in hospitals is between 5.2 days and 6.4 days, which looks close to the 5.9 days given in the Health System Review for the year 2013. The average length of stay in rehabilitation clinics is 24.6 days and 34.4 days for psychiatrics clinics, which is much longer than in hospitals. 

In Figure 2, we can see that the number of patients going out of the hospitals is by far higher than the patients going out of specialized clinics. The two figures are complementary: indeed, the faster a patient can go out (smaller average length of stay), the more patients can be taken into the care system and therefore more patients can be treated. However, this also depends on the number of beds per units, which is not contained in this dataset.

**[Dataset 2] Hôpitaux: nombre de lits et hospitalisations par type d'activité et canton**

	Years       | 1998-2018
	Categories  | Soins aigus et maison de naissance
	            | Psychiatrie													
                | Réadaptation/Gériatrie

In this dataset, the categories are slightly different than in [Dataset 1], despite the fact that they both correspond to healthcare sectors. We can however consider “soins aigus et maison de naissance” (blue sector in Figure 3) to correspond to the hospitals categories in [Dataset 1], in opposition to the  “phychiatrie” and “réadaptation/gériatrie” (red and green sectors in Figure 3) corresponding to the specialized clinics in [Dataset 1]. 

![Figure 3](/figure/Figure34.png)

In [Dataset 1], the number of out-going patient from hospitals is 84%. Here, as shown in Figure 4, the number of hospitalizations in hospitals correspond to 88% of the total number of hospitalizations. By comparing the proportion between the two charts in Figure 3 and Figure 4, there are less beds in hospitals than the number of hospitalization in hospitals in terms of percentage. With this ascertainment, the length of stay in hospital will play a key role to avoid to clog the healthcare system.

**[Dataset 3] Professions de la santé selon le sexe: diplômes délivrés**

    Years       | 1985 à 2005
	Categories  | Médecins
	            | Dentistes
	            | Soins infirmiers
	            | Aide soignant
	            | Sage-femmes
	Sort by     | Sexe

![Figure 5](/figure/Figure5.png)


The third dataset spans over 20 years which allows to visualize the trend over time. By plotting the male/female ratio for each category of jobs (Figure 5), we can see that the gender gap is going down over the years for doctors and dentists but does not change (or even get bigger) for the nurses, caregivers and midwives. What is also very interesting in this dataset is that all the categories contains two columns for male and female, except for the midwives. Is it really true that no man were practionners in this field before 2005 or it is just because the name of the function is gender-biased?

### Related work
The Swiss Federal Statistical Office published Hospital Statistics [2] in 2018, which uses different dataset (the three datasets described above are amongst them) to provide information on the heathcare system in Switzerland. Whereas the report covers very interesting aspects, it is pretty long and heavy and targets an audiance who is familiar in reading graphs and stats. 

In this project, I’d like to use the concept of “Focus+Context” to display the information on a single webpage. I will make use of interactive data visualization to engage the user in understanding the trends and numbers in an accessible way.

As part of my inspiration is the current interactive dataviz for COVID progression by John Hopkins University [3]. I also like the non-interactive but dynamic dataviz of Robert Rhode [4] who is always translating numbers into nice graphs. For more complex numbers and maths, I recently came across a very nice interactive dataviz for epidemic calculator by Gabriel Goh [5].

### Sources
[1] http://www.euro.who.int/__data/assets/pdf_file/0010/293689/Switzerland-HiT.pdf

[2] https://www.bfs.admin.ch/bfs/fr/home/statistiques/catalogues-banques-donnees.gnpdetail.2019-0190.html

[3] https://coronavirus.jhu.edu/map.html

[4] https://twitter.com/RARohde/status/1245807944102490114

[5] http://gabgoh.github.io/COVID/index.html

## Milestone 2 (Friday 1st May, 5pm)
**10% of the final grade**



## Milestone 3 (Thursday 28th May, 5pm)
**80% of the final grade**






