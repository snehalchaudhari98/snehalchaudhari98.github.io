# Homework #4: Innovative Visualization Design

In this homework, you will create a unique visualization that goes beyond the "common chart types" that you already exist. **This assignment is worth 10 points.**

The audience for this visualization is visitors to a musuem. The goal is to create a visually interesting and informative visualization graphic/infographic exhibit that communicates (some or all of) the dataset effectively and in a creative manner (as opposed to supporting in-depth analysis such as might be done by domain experts).

There are three datasets available for this homework (choose one).

* Bigfoot sightings ([souce](https://www.kaggle.com/datasets/chemcnabb/bfro-bigfoot-sighting-report)): This dataset contains reports from the Bigfoot Field Researchers Organization.
* NASA Exoplanets ([source](https://www.kaggle.com/datasets/adityamishraml/nasaexoplanets)): This dataset contains a catalogue of exoplanets discovered by NASA missions.
* Jurassic Park - The Exhaustive Dinosaur Dataset ([source](https://www.kaggle.com/datasets/kjanjua/jurassic-park-the-exhaustive-dinosaur-dataset)): a dataset listing dinosaur information, including type, diet, area they lived, etc.

## Requirements

* Create a page `index.html` in this repostory for storing your visualization. You'll also want to include your chosen dataset in your submitted repository.
* Create a unique, D3-based visualization graphic (or infographic) that is not simply an existing technique or D3 block. 
    * This requirement is akin to what the VAST MC projects must do as one of their requirements. From the Project Types page: "_One of the implemented visualizations must be an "innovative" view, that is either (a) an extension of an existing visualization type, or (b) a novel visualization type._"
    * You may import existing code, but you must document exactly what modifications you make in your writeup, and you should _substantially_ change any imported code that you build upon. If you're unsure what constitutes substantial, talk to the TA.
* You must visualize at least three different attributes. 
    * You must use at least one quantatitive and one categorical attribute. (Temporal attributes count as quantatitive.)
    * If you choose to represent the data spatially (e.g., using the lat/long coordinates in the Bigfoot dataset, or if you derive the lat/long coordinates from the dinsoaur dataset), these will count as one attribute, so you need at least two more attributes in your chart.
* You are not required to visualize _all_ of the given data. You may focus on a specific topic or question that you want to address, and therefore you might only need to look at a subset of the data (attributes or items) to answer it. If you only want to visualize a subset of the dataset, you must include at least 30 data points (and these must be chosen in a way that helps to support your museum exhibit's story).
* One approach for creating a unique visualization is to create custom glyphs. Here are some examples that can provide inspiration.
    * [lalettura](http://giorgialupi.com/lalettura)
    * [film flowers](http://sxywu.com/filmflowers/)
    * [Visualizing Painter's Lives](http://giorgialupi.com/visualizing-painters-lives)
    * [How's life?](http://www.oecdbetterlifeindex.org/#/31111111111)
    * [Where the Wild Bees Are](https://www.scientificamerican.com/article/where-the-wild-bees-are/)
    * [Giorgia Lupi and Stefanie Posavec’s Life Data Visualizations](https://www.moma.org/magazine/articles/309)
    * [The Metropolitan Museum Partnership 2019](https://parsons.nyc/met-museum-2019/)
* You may choose to create either a static or interactive exhibit.
* Above your chart/infographic, add a title and short description that explains your design (marks, channels, interactions).
* If you modified an existing block, below the visualization provide a link to the original source code and describe (in detail) how you modified it to create your chart.

You are free (and encouraged!) to be creative on this assignment, including the use of abstract, artistic, and illustrative designs. Don't submit just a basic D3 block (bar chart, scatterplot, pie/donut chart, line chart, node-link diagram, tree, etc.), or you'll receive a 0 on this assignment. Especially creative or interesting submissions are eligible for up to 2 points extra credit.
